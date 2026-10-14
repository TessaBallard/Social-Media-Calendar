import { logger } from "../lib/logger";
import { requireSupabaseClient } from "../lib/supabaseClient";
import { requireSignedInUserId } from "./authService";
import { mapAppRow, toAppInsert } from "./appsService";
import type { AppFormValues, AppRecord, AppsRepository } from "../types/appRecord";

const APP_COLUMNS = "id, name, store_url, notes, created_at, user_id";

function loadFailedError(): Error {
  return new Error("Apps could not be loaded. Please try again.");
}

function saveFailedError(): Error {
  return new Error("This app could not be saved. Please try again.");
}

function notFoundError(): Error {
  return new Error("This app could not be saved because it was not found.");
}

async function requireConfiguredClient() {
  return requireSupabaseClient();
}

// Saves and loads D-001 App Information from Supabase.
export const supabaseAppsRepository: AppsRepository = {
  async listApps(): Promise<AppRecord[]> {
    const client = await requireConfiguredClient();
    logger.debug("Loading apps from storage");

    const { data, error } = await client
      .from("apps")
      .select(APP_COLUMNS)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Failed to load apps", error);
      throw loadFailedError();
    }

    return (data ?? []).map(mapAppRow);
  },

  async createApp(values: AppFormValues): Promise<AppRecord> {
    const client = await requireConfiguredClient();
    const userId = await requireSignedInUserId();
    logger.debug("Creating app in storage", { name: values.name.trim() });

    const { data, error } = await client
      .from("apps")
      .insert(toAppInsert(values, userId))
      .select(APP_COLUMNS)
      .single();

    if (error || !data) {
      logger.error("Failed to create app", error);
      throw saveFailedError();
    }

    return mapAppRow(data);
  },

  async updateApp(id: string, values: AppFormValues): Promise<AppRecord> {
    const client = await requireConfiguredClient();
    logger.debug("Updating app in storage", { id, name: values.name.trim() });

    const { data, error } = await client
      .from("apps")
      .update(toAppInsert(values))
      .eq("id", id)
      .select(APP_COLUMNS)
      .maybeSingle();

    if (error) {
      logger.error("Failed to update app", error);
      throw saveFailedError();
    }

    if (!data) {
      logger.error("App could not be updated because it was not found", { id });
      throw notFoundError();
    }

    return mapAppRow(data);
  },
};
