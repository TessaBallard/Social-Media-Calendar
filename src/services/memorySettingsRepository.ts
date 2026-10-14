import { requireCurrentUserId } from "../lib/ownedRecords";
import { TEST_USER } from "../types/auth";
import { createDefaultSettings, sanitizeUserSettingsValues } from "./settingsService";
import type { SettingsRepository, UserSettings, UserSettingsValues } from "../types/userSettings";

// In-memory store used only by tests. The real app saves settings to Supabase.
export function createMemorySettingsRepository(
  initialSettings?: UserSettings,
  getUserId: () => string | null = () => TEST_USER.id,
): SettingsRepository {
  const byUser = new Map<string, UserSettings>();

  if (initialSettings) {
    const initialUserId = initialSettings.userId ?? TEST_USER.id;
    byUser.set(initialUserId, {
      ...initialSettings,
      filters: { ...initialSettings.filters },
      userId: initialUserId,
    });
  }

  return {
    async getSettings(): Promise<UserSettings> {
      const userId = getUserId();
      if (!userId) {
        return createDefaultSettings();
      }

      const stored = byUser.get(userId);
      if (!stored) {
        return { ...createDefaultSettings(), userId };
      }

      return { ...stored, filters: { ...stored.filters } };
    },

    async saveSettings(values: UserSettingsValues): Promise<UserSettings> {
      const userId = requireCurrentUserId(getUserId());
      const sanitized = sanitizeUserSettingsValues(values);
      const current = byUser.get(userId) ?? { ...createDefaultSettings(), userId };
      const settings: UserSettings = {
        id: current.id,
        ...sanitized,
        filters: { ...sanitized.filters },
        updatedAt: new Date().toISOString(),
        userId,
      };
      byUser.set(userId, settings);
      return { ...settings, filters: { ...settings.filters } };
    },
  };
}
