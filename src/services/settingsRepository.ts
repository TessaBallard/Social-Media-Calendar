import { logger } from "../lib/logger";
import { requireSupabaseClient } from "../lib/supabaseClient";
import { requireSignedInUserId } from "./authService";
import { createDefaultSettings, mapSettingsRow, toSettingsUpsert } from "./settingsService";
import type { SettingsRepository, UserSettings, UserSettingsValues } from "../types/userSettings";

const SETTINGS_COLUMNS =
  "id, user_id, calendar_view, filter_app_id, filter_platform, filter_status, filter_priority, remember_filters, color_scheme, updated_at";

function loadFailedError(): Error {
  return new Error("Saved preferences could not be loaded. Please try again.");
}

function saveFailedError(): Error {
  return new Error("Saved preferences could not be saved. Please try again.");
}

// Saves and loads D-003 User Settings from Supabase.
export const supabaseSettingsRepository: SettingsRepository = {
  async getSettings(): Promise<UserSettings> {
    const client = requireSupabaseClient();
    logger.debug("Loading user settings from storage");

    const { data, error } = await client
      .from("user_settings")
      .select(SETTINGS_COLUMNS)
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error("Failed to load user settings", error);
      throw loadFailedError();
    }

    if (!data) {
      logger.debug("No stored user settings yet; using defaults");
      return createDefaultSettings();
    }

    return mapSettingsRow(data);
  },

  async saveSettings(values: UserSettingsValues): Promise<UserSettings> {
    const client = requireSupabaseClient();
    const userId = await requireSignedInUserId();
    logger.debug("Saving user settings", {
      calendarView: values.calendarView,
      rememberFilters: values.rememberFilters,
      colorScheme: values.colorScheme,
    });

    const { data, error } = await client
      .from("user_settings")
      .upsert(toSettingsUpsert(values, userId), { onConflict: "user_id" })
      .select(SETTINGS_COLUMNS)
      .single();

    if (error || !data) {
      logger.error("Failed to save user settings", error);
      throw saveFailedError();
    }

    return mapSettingsRow(data);
  },
};
