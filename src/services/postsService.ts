import type {
  PostFormValues,
  PostPlatform,
  PostPriority,
  PostRecord,
  PostRow,
  PostStatus,
} from "../types/postRecord";

export function createPostRecord(values: PostFormValues): PostRecord {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: values.title.trim(),
    appId: values.appId,
    platform: values.platform as PostPlatform,
    dueDate: values.dueDate,
    status: values.status as PostStatus,
    priority: values.priority as PostPriority,
    notes: values.notes.trim(),
    content: values.content.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function applyPostUpdate(post: PostRecord, values: PostFormValues): PostRecord {
  return {
    ...post,
    title: values.title.trim(),
    appId: values.appId,
    platform: values.platform as PostPlatform,
    dueDate: values.dueDate,
    status: values.status as PostStatus,
    priority: values.priority as PostPriority,
    notes: values.notes.trim(),
    content: values.content.trim(),
    updatedAt: new Date().toISOString(),
  };
}

export function toPostFormValues(post: PostRecord): PostFormValues {
  return {
    title: post.title,
    appId: post.appId,
    platform: post.platform,
    dueDate: post.dueDate,
    status: post.status,
    priority: post.priority,
    notes: post.notes,
    content: post.content,
  };
}

export function sortPostsByDueDate(posts: PostRecord[]): PostRecord[] {
  return [...posts].sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}

function toDateOnly(value: string): string {
  return value.slice(0, 10);
}

export function mapPostRow(row: PostRow): PostRecord {
  return {
    id: row.id,
    title: row.title,
    appId: row.app_id,
    platform: row.platform as PostPlatform,
    dueDate: toDateOnly(row.due_date),
    status: row.status as PostStatus,
    priority: row.priority as PostPriority,
    notes: row.notes ?? "",
    content: row.content ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.user_id ? { userId: row.user_id } : {}),
  };
}

export function toPostInsert(values: PostFormValues, userId?: string) {
  return {
    title: values.title.trim(),
    app_id: values.appId,
    platform: values.platform,
    due_date: values.dueDate,
    status: values.status,
    priority: values.priority,
    notes: values.notes.trim(),
    content: values.content.trim(),
    ...(userId ? { user_id: userId } : {}),
  };
}

export function toPostUpdate(values: PostFormValues, userId?: string) {
  return {
    ...toPostInsert(values, userId),
    updated_at: new Date().toISOString(),
  };
}
