export type AppFormValues = {
  name: string;
  storeUrl: string;
  notes: string;
};

export type AppFormErrors = Partial<Record<keyof AppFormValues, string>>;

// An App Store app the user is planning social media posts for.
export type AppRecord = {
  id: string;
  name: string;
  storeUrl: string;
  notes: string;
  createdAt: string;
  userId?: string;
};

export type AppRow = {
  id: string;
  name: string;
  store_url: string;
  notes: string | null;
  created_at: string;
  user_id?: string | null;
};

export type AppsRepository = {
  listApps: () => Promise<AppRecord[]>;
  createApp: (values: AppFormValues) => Promise<AppRecord>;
  updateApp: (id: string, values: AppFormValues) => Promise<AppRecord>;
};

export const EMPTY_APP_FORM: AppFormValues = {
  name: "",
  storeUrl: "",
  notes: "",
};
