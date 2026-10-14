import { describe, expect, it } from "vitest";
import {
  createDefaultSettings,
  mapSettingsRow,
  postQueryFromSettings,
  sanitizeUserSettingsValues,
  storedFiltersFromQuery,
  toSettingsUpsert,
} from "../src/services/settingsService";
import { EMPTY_POST_QUERY } from "../src/lib/filterPosts";
import { DEFAULT_SETTINGS_ID, EMPTY_STORED_FILTERS } from "../src/types/userSettings";

describe("user settings mapping", () => {
  it("maps a stored settings row into the settings used by the UI", () => {
    const settings = mapSettingsRow({
      id: DEFAULT_SETTINGS_ID,
      calendar_view: "Week",
      filter_app_id: "app-1",
      filter_platform: "Instagram",
      filter_status: "Planned",
      filter_priority: "High",
      remember_filters: true,
      color_scheme: "Dark",
      updated_at: "2026-10-13T00:00:00.000Z",
    });

    expect(settings).toEqual({
      id: DEFAULT_SETTINGS_ID,
      calendarView: "Week",
      filters: {
        appId: "app-1",
        platform: "Instagram",
        status: "Planned",
        priority: "High",
      },
      rememberFilters: true,
      colorScheme: "Dark",
      updatedAt: "2026-10-13T00:00:00.000Z",
    });
  });

  it("falls back to defaults when stored values are missing or invalid", () => {
    const settings = mapSettingsRow({
      id: DEFAULT_SETTINGS_ID,
      calendar_view: "Year",
      filter_app_id: null,
      filter_platform: "MySpace",
      filter_status: null,
      filter_priority: "Critical",
      remember_filters: null,
      updated_at: "2026-10-13T00:00:00.000Z",
    });

    expect(settings.calendarView).toBe("Month");
    expect(settings.filters).toEqual(EMPTY_STORED_FILTERS);
    expect(settings.rememberFilters).toBe(true);
    expect(settings.colorScheme).toBe("System");
  });

  it("prepares values for saving", () => {
    const row = toSettingsUpsert(
      {
        calendarView: "Day",
        filters: {
          appId: " app-1 ",
          platform: "TikTok",
          status: "Ready",
          priority: "Urgent",
        },
        rememberFilters: false,
        colorScheme: "Dark",
      },
      "user-1",
    );

    expect(row).toMatchObject({
      user_id: "user-1",
      calendar_view: "Day",
      filter_app_id: "app-1",
      filter_platform: "TikTok",
      filter_status: "Ready",
      filter_priority: "Urgent",
      remember_filters: false,
      color_scheme: "Dark",
    });
  });

  it("turns settings into a post query and back", () => {
    const settings = sanitizeUserSettingsValues({
      calendarView: "Month",
      filters: {
        appId: "app-2",
        platform: "X",
        status: "In Progress",
        priority: "Low",
      },
      rememberFilters: true,
      colorScheme: "Light",
    });

    expect(postQueryFromSettings(settings)).toEqual({
      ...EMPTY_POST_QUERY,
      appId: "app-2",
      platform: "X",
      status: "In Progress",
      priority: "Low",
    });
    expect(storedFiltersFromQuery(postQueryFromSettings(settings))).toEqual(settings.filters);
  });

  it("does not restore filters when the user asked not to remember them", () => {
    expect(
      postQueryFromSettings({
        ...createDefaultSettings(),
        rememberFilters: false,
        filters: {
          appId: "app-1",
          platform: "Instagram",
          status: "Planned",
          priority: "High",
        },
      }),
    ).toEqual(EMPTY_POST_QUERY);
  });
});
