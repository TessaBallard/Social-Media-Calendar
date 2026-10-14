import type { PostRecord } from "../types/postRecord";

// F-010 / F-011: Calendar and Timeline share one query for filters and search.
export type PostQuery = {
  search: string;
  appId: string;
  platform: string;
  status: string;
  priority: string;
  dueDate: string;
};

export const EMPTY_POST_QUERY: PostQuery = {
  search: "",
  appId: "",
  platform: "",
  status: "",
  priority: "",
  dueDate: "",
};

export function isPostQueryActive(query: PostQuery): boolean {
  return (
    query.search.trim() !== "" ||
    query.appId !== "" ||
    query.platform !== "" ||
    query.status !== "" ||
    query.priority !== "" ||
    query.dueDate !== ""
  );
}

function matchesSearch(post: PostRecord, search: string): boolean {
  const needle = search.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  // F-011: Search matches the post title or notes, not the post content.
  return post.title.toLowerCase().includes(needle) || post.notes.toLowerCase().includes(needle);
}

export function matchesPostQuery(post: PostRecord, query: PostQuery): boolean {
  if (query.appId && post.appId !== query.appId) {
    return false;
  }

  if (query.platform && post.platform !== query.platform) {
    return false;
  }

  if (query.status && post.status !== query.status) {
    return false;
  }

  if (query.priority && post.priority !== query.priority) {
    return false;
  }

  if (query.dueDate && post.dueDate !== query.dueDate) {
    return false;
  }

  return matchesSearch(post, query.search);
}

export function filterPosts(posts: PostRecord[], query: PostQuery): PostRecord[] {
  if (!isPostQueryActive(query)) {
    return posts;
  }

  return posts.filter((post) => matchesPostQuery(post, query));
}
