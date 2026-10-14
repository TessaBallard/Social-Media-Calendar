import type { PostRecord } from "../types/postRecord";

export function postsForApp(posts: PostRecord[], appId: string): PostRecord[] {
  return posts.filter((post) => post.appId === appId);
}

export function plannedPostsLabel(count: number): string {
  return `${count} planned ${count === 1 ? "post" : "posts"}`;
}
