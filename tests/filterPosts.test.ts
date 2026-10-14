import { describe, expect, it } from "vitest";
import { EMPTY_POST_QUERY, filterPosts, isPostQueryActive } from "../src/lib/filterPosts";
import type { PostRecord } from "../src/types/postRecord";

function post(overrides: Partial<PostRecord>): PostRecord {
  return {
    id: "post-1",
    title: "Launch post",
    appId: "app-1",
    platform: "Instagram",
    dueDate: "2026-09-10",
    status: "Planned",
    priority: "Normal",
    notes: "Film in the morning",
    content: "Secret caption draft",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
    ...overrides,
  };
}

describe("B-012 filter posts", () => {
  const posts = [
    post({ id: "ig-planned" }),
    post({
      id: "tt-ready",
      title: "Spending Trends",
      appId: "app-2",
      platform: "TikTok",
      dueDate: "2026-09-12",
      status: "Ready",
      priority: "High",
      notes: "Use the beach clip",
    }),
  ];

  it("returns every post when the query is empty", () => {
    expect(isPostQueryActive(EMPTY_POST_QUERY)).toBe(false);
    expect(filterPosts(posts, EMPTY_POST_QUERY)).toEqual(posts);
  });

  it("filters by app, platform, status, priority, and date", () => {
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, appId: "app-2" }).map((item) => item.id)).toEqual([
      "tt-ready",
    ]);
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, platform: "Instagram" }).map((item) => item.id)).toEqual([
      "ig-planned",
    ]);
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, status: "Ready" }).map((item) => item.id)).toEqual([
      "tt-ready",
    ]);
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, priority: "High" }).map((item) => item.id)).toEqual([
      "tt-ready",
    ]);
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, dueDate: "2026-09-10" }).map((item) => item.id)).toEqual([
      "ig-planned",
    ]);
  });

  it("searches by title or notes and ignores post content", () => {
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, search: "launch" }).map((item) => item.id)).toEqual([
      "ig-planned",
    ]);
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, search: "BEACH" }).map((item) => item.id)).toEqual([
      "tt-ready",
    ]);
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, search: "Secret caption" })).toEqual([]);
  });

  it("applies search and filters together", () => {
    expect(
      filterPosts(posts, { ...EMPTY_POST_QUERY, search: "Trends", platform: "TikTok" }).map((item) => item.id),
    ).toEqual(["tt-ready"]);
    expect(filterPosts(posts, { ...EMPTY_POST_QUERY, search: "Trends", platform: "Instagram" })).toEqual([]);
  });
});
