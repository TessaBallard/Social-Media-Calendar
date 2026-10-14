import type { CalendarView } from "../lib/calendarDate";
import { DEFAULT_COLOR_SCHEME, type ColorScheme } from "../lib/colorScheme";

// D-003: Selected filters remembered across Calendar and Timeline.
export type StoredPostFilters = {
  appId: string;
  platform: string;
  status: string;
  priority: string;
};

export type UserSettingsValues = {
  calendarView: CalendarView;
  filters: StoredPostFilters;
  rememberFilters: boolean;
  colorScheme: ColorScheme;
};

export type UserSettings = UserSettingsValues & {
  id: string;
  updatedAt: string;
  userId?: string;
};

export type UserSettingsRow = {
  id: string;
  user_id?: string | null;
  calendar_view: string;
  filter_app_id: string | null;
  filter_platform: string | null;
  filter_status: string | null;
  filter_priority: string | null;
  remember_filters: boolean | null;
  color_scheme?: string | null;
  updated_at: string;
};

export type SettingsRepository = {
  getSettings: () => Promise<UserSettings>;
  saveSettings: (values: UserSettingsValues) => Promise<UserSettings>;
};

export const EMPTY_STORED_FILTERS: StoredPostFilters = {
  appId: "",
  platform: "",
  status: "",
  priority: "",
};

export const DEFAULT_USER_SETTINGS_VALUES: UserSettingsValues = {
  calendarView: "Month",
  filters: EMPTY_STORED_FILTERS,
  rememberFilters: true,
  colorScheme: DEFAULT_COLOR_SCHEME,
};

export const DEFAULT_SETTINGS_ID = "11111111-1111-4111-8111-111111111111";
