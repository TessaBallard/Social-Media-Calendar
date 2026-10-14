import type { AppFormValues, AppRecord, AppRow } from "../types/appRecord";

export function createAppRecord(values: AppFormValues): AppRecord {
  return {
    id: crypto.randomUUID(),
    name: values.name.trim(),
    storeUrl: values.storeUrl.trim(),
    notes: values.notes.trim(),
    createdAt: new Date().toISOString(),
  };
}

export function applyAppUpdate(app: AppRecord, values: AppFormValues): AppRecord {
  return {
    ...app,
    name: values.name.trim(),
    storeUrl: values.storeUrl.trim(),
    notes: values.notes.trim(),
  };
}

export function toAppFormValues(app: AppRecord): AppFormValues {
  return {
    name: app.name,
    storeUrl: app.storeUrl,
    notes: app.notes,
  };
}

export function mapAppRow(row: AppRow): AppRecord {
  return {
    id: row.id,
    name: row.name,
    storeUrl: row.store_url,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    ...(row.user_id ? { userId: row.user_id } : {}),
  };
}

export function toAppInsert(values: AppFormValues, userId?: string) {
  return {
    name: values.name.trim(),
    store_url: values.storeUrl.trim(),
    notes: values.notes.trim(),
    ...(userId ? { user_id: userId } : {}),
  };
}
