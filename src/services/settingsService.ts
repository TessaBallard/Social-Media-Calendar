import { CALENDAR_VIEWS, type CalendarView } from "../lib/calendarDate";
import { readStoredColorScheme, sanitizeColorScheme } from "../lib/colorScheme";
import { EMPTY_POST_QUERY, type PostQuery } from "../lib/filterPosts";
import {
  DEFAULT_SETTINGS_ID,
  DEFAULT_USER_SETTINGS_VALUES,
  EMPTY_STORED_FILTERS,
  type StoredPostFilters,
  type UserSettings,
  type UserSettingsRow,
  type UserSettingsValues,
} from "../types/userSettings";
import { POST_PLATFORMS, POST_PRIORITIES, POST_STATUSES } from "../types/postRecord";

function allowedOrEmpty(value: string, allowed: readonly string[]): string {
  return allowed.includes(value) ? value : "";
}

export function createDefaultSettings(updatedAt = new Date().toISOString()): UserSettings {
  return {
    id: DEFAULT_SETTINGS_ID,
    ...DEFAULT_USER_SETTINGS_VALUES,
    // Keep a Dark choice made on the sign-in page when no saved row exists yet.
    colorScheme: readStoredColorScheme(),
    filters: { ...EMPTY_STORED_FILTERS },
    updatedAt,
  };
}

export function sanitizeCalendarView(value: string): CalendarView {
  return (CALENDAR_VIEWS as readonly string[]).includes(value)
    ? (value as CalendarView)
    : DEFAULT_USER_SETTINGS_VALUES.calendarView;
}

export function sanitizeStoredFilters(filters: StoredPostFilters): StoredPostFilters {
  return {
    appId: filters.appId.trim(),
    platform: allowedOrEmpty(filters.platform, POST_PLATFORMS),
    status: allowedOrEmpty(filters.status, POST_STATUSES),
    priority: allowedOrEmpty(filters.priority, POST_PRIORITIES),
  };
}

export function sanitizeUserSettingsValues(values: UserSettingsValues): UserSettingsValues {
  return {
    calendarView: sanitizeCalendarView(values.calendarView),
    filters: sanitizeStoredFilters(values.filters),
    rememberFilters: Boolean(values.rememberFilters),
    colorScheme: sanitizeColorScheme(values.colorScheme),
  };
}

export function postQueryFromSettings(settings: UserSettingsValues): PostQuery {
  return {
    ...EMPTY_POST_QUERY,
    ...(settings.rememberFilters ? settings.filters : EMPTY_STORED_FILTERS),
  };
}

export function storedFiltersFromQuery(query: PostQuery): StoredPostFilters {
  return sanitizeStoredFilters({
    appId: query.appId,
    platform: query.platform,
    status: query.status,
    priority: query.priority,
  });
}

export function mapSettingsRow(row: UserSettingsRow): UserSettings {
  return {
    id: row.id,
    calendarView: sanitizeCalendarView(row.calendar_view),
    filters: sanitizeStoredFilters({
      appId: row.filter_app_id ?? "",
      platform: row.filter_platform ?? "",
      status: row.filter_status ?? "",
      priority: row.filter_priority ?? "",
    }),
    rememberFilters: row.remember_filters ?? DEFAULT_USER_SETTINGS_VALUES.rememberFilters,
    colorScheme: sanitizeColorScheme(row.color_scheme ?? readStoredColorScheme()),
    updatedAt: row.updated_at,
    ...(row.user_id ? { userId: row.user_id } : {}),
  };
}

export function toSettingsUpsert(values: UserSettingsValues, userId: string) {
  const sanitized = sanitizeUserSettingsValues(values);

  return {
    user_id: userId,
    calendar_view: sanitized.calendarView,
    filter_app_id: sanitized.filters.appId,
    filter_platform: sanitized.filters.platform,
    filter_status: sanitized.filters.status,
    filter_priority: sanitized.filters.priority,
    remember_filters: sanitized.rememberFilters,
    color_scheme: sanitized.colorScheme,
    updated_at: new Date().toISOString(),
  };
}
