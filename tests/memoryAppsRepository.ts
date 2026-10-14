import { belongsToCurrentUser, requireCurrentUserId } from "../src/lib/ownedRecords";
import { applyAppUpdate, createAppRecord } from "../src/services/appsService";
import { TEST_USER } from "../src/types/auth";
import type { AppFormValues, AppRecord, AppsRepository } from "../src/types/appRecord";

// In-memory store used only by tests. The real app saves to Supabase.
export function createMemoryAppsRepository(
  initialApps: AppRecord[] = [],
  getUserId: () => string | null = () => TEST_USER.id,
): AppsRepository {
  const apps = [...initialApps];

  function ownedApps(): AppRecord[] {
    const userId = getUserId();
    return apps.filter((app) => belongsToCurrentUser(app.userId, userId));
  }

  return {
    async listApps(): Promise<AppRecord[]> {
      return ownedApps();
    },

    async createApp(values: AppFormValues): Promise<AppRecord> {
      const userId = requireCurrentUserId(getUserId());
      const app = { ...createAppRecord(values), userId };
      apps.push(app);
      return app;
    },

    async updateApp(id: string, values: AppFormValues): Promise<AppRecord> {
      const userId = requireCurrentUserId(getUserId());
      const index = apps.findIndex(
        (app) => app.id === id && belongsToCurrentUser(app.userId, userId),
      );

      if (index < 0) {
        throw new Error("This app could not be saved because it was not found.");
      }

      const updated = { ...applyAppUpdate(apps[index], values), userId: apps[index].userId };
      apps[index] = updated;
      return updated;
    },
  };
}
