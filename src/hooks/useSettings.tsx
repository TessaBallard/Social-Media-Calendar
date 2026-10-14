import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { logger } from "../lib/logger";
import { supabaseSettingsRepository } from "../services/settingsRepository";
import { createDefaultSettings, sanitizeUserSettingsValues } from "../services/settingsService";
import { useColorScheme } from "./useColorScheme";
import type {
  SettingsRepository,
  UserSettings,
  UserSettingsValues,
} from "../types/userSettings";

type LoadStatus = "loading" | "ready" | "error";

type SettingsContextValue = {
  settings: UserSettings;
  status: LoadStatus;
  error: string | null;
  saveError: string | null;
  updateSettings: (values: Partial<UserSettingsValues>) => void;
  reload: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

type SettingsProviderProps = {
  children: ReactNode;
  repository?: SettingsRepository;
};

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function toValues(settings: UserSettings): UserSettingsValues {
  return {
    calendarView: settings.calendarView,
    filters: settings.filters,
    rememberFilters: settings.rememberFilters,
    colorScheme: settings.colorScheme,
  };
}

// Loads and updates D-003 User Settings from the online store.
export function SettingsProvider({
  children,
  repository = supabaseSettingsRepository,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(createDefaultSettings);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { setScheme } = useColorScheme();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const reload = useCallback(async (): Promise<void> => {
    setStatus("loading");
    setError(null);

    try {
      const record = await repository.getSettings();
      logger.debug("Loaded user settings", {
        calendarView: record.calendarView,
        rememberFilters: record.rememberFilters,
        colorScheme: record.colorScheme,
      });
      settingsRef.current = record;
      setSettings(record);
      setStatus("ready");
    } catch (loadError) {
      logger.error("User settings could not be loaded", loadError);
      const fallback = createDefaultSettings();
      settingsRef.current = fallback;
      setSettings(fallback);
      setStatus("error");
      setError(toErrorMessage(loadError, "Saved preferences could not be loaded. Please try again."));
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    logger.debug("Applying saved colour scheme", { colorScheme: settings.colorScheme });
    setScheme(settings.colorScheme);
  }, [setScheme, settings.colorScheme, status]);

  const updateSettings = useCallback(
    (values: Partial<UserSettingsValues>): void => {
      const nextValues = sanitizeUserSettingsValues({
        ...toValues(settingsRef.current),
        ...values,
        filters: values.filters ?? settingsRef.current.filters,
      });
      const next: UserSettings = {
        ...settingsRef.current,
        ...nextValues,
        filters: { ...nextValues.filters },
      };
      settingsRef.current = next;
      setSettings(next);
      setSaveError(null);

      void repository
        .saveSettings(nextValues)
        .then((saved) => {
          settingsRef.current = {
            ...settingsRef.current,
            id: saved.id,
            updatedAt: saved.updatedAt,
          };
          logger.debug("Saved user settings", {
            calendarView: saved.calendarView,
            rememberFilters: saved.rememberFilters,
            colorScheme: saved.colorScheme,
          });
        })
        .catch((saveFailed) => {
          logger.error("User settings could not be saved", saveFailed);
          setSaveError(
            toErrorMessage(saveFailed, "Saved preferences could not be saved. Please try again."),
          );
        });
    },
    [repository],
  );

  const value = useMemo<SettingsContextValue>(() => {
    return {
      settings,
      status,
      error,
      saveError,
      updateSettings,
      reload,
    };
  }, [settings, status, error, saveError, updateSettings, reload]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsOptional(): SettingsContextValue | null {
  return useContext(SettingsContext);
}

export function useSettings(): SettingsContextValue {
  const context = useSettingsOptional();

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider.");
  }

  return context;
}
