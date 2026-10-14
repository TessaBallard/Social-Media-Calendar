import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logger } from "../lib/logger";
import { supabaseAppsRepository } from "../services/appsRepository";
import type { AppFormValues, AppRecord, AppsRepository } from "../types/appRecord";

type LoadStatus = "loading" | "ready" | "error";

type AppsContextValue = {
  apps: AppRecord[];
  status: LoadStatus;
  error: string | null;
  getApp: (id: string) => AppRecord | undefined;
  addApp: (values: AppFormValues) => Promise<AppRecord>;
  updateApp: (id: string, values: AppFormValues) => Promise<AppRecord>;
  reload: () => Promise<void>;
};

const AppsContext = createContext<AppsContextValue | null>(null);

type AppsProviderProps = {
  children: ReactNode;
  repository?: AppsRepository;
};

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// Loads and updates D-001 App Information from the online store.
export function AppsProvider({
  children,
  repository = supabaseAppsRepository,
}: AppsProviderProps) {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    setStatus("loading");
    setError(null);

    try {
      const records = await repository.listApps();
      logger.debug("Loaded apps from storage", { count: records.length });
      setApps(records);
      setStatus("ready");
    } catch (loadError) {
      logger.error("Apps could not be loaded", loadError);
      setApps([]);
      setStatus("error");
      setError(toErrorMessage(loadError, "Apps could not be loaded. Please try again."));
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addApp = useCallback(
    async (values: AppFormValues): Promise<AppRecord> => {
      const app = await repository.createApp(values);
      logger.debug("Added app", { id: app.id, name: app.name });
      setApps((current) => [...current, app]);
      return app;
    },
    [repository],
  );

  const updateApp = useCallback(
    async (id: string, values: AppFormValues): Promise<AppRecord> => {
      const updated = await repository.updateApp(id, values);
      logger.debug("Updated app", { id: updated.id, name: updated.name });
      setApps((current) => current.map((app) => (app.id === id ? updated : app)));
      return updated;
    },
    [repository],
  );

  const value = useMemo<AppsContextValue>(() => {
    return {
      apps,
      status,
      error,
      getApp: (id: string) => apps.find((app) => app.id === id),
      addApp,
      updateApp,
      reload,
    };
  }, [apps, status, error, addApp, updateApp, reload]);

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

export function useApps(): AppsContextValue {
  const context = useContext(AppsContext);

  if (!context) {
    throw new Error("useApps must be used inside AppsProvider.");
  }

  return context;
}
