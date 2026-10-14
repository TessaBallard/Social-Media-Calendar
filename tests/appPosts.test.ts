import { describe, expect, it } from "vitest";
import { plannedPostsLabel, postsForApp } from "../src/lib/appPosts";
import type { PostRecord } from "../src/types/postRecord";

function post(appId: string, title: string): PostRecord {
  return {
    id: `${appId}-${title}`,
    title,
    appId,
    platform: "Instagram",
    dueDate: "2026-09-10",
    status: "Planned",
    priority: "Normal",
    notes: "",
    content: "",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
  };
}

describe("B-015 app posts", () => {
  it("keeps posts that belong to one app", () => {
    const posts = [post("app-1", "Launch post"), post("app-2", "Other post")];

    expect(postsForApp(posts, "app-1").map((item) => item.title)).toEqual(["Launch post"]);
  });

  it("labels the planned post count", () => {
    expect(plannedPostsLabel(0)).toBe("0 planned posts");
    expect(plannedPostsLabel(1)).toBe("1 planned post");
    expect(plannedPostsLabel(2)).toBe("2 planned posts");
  });
});
