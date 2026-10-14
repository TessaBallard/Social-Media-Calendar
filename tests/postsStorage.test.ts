import { describe, expect, it } from "vitest";
import { mapPostRow, toPostInsert } from "../src/services/postsService";

describe("post storage mapping", () => {
  it("maps a stored post row into the post used by the UI", () => {
    const post = mapPostRow({
      id: "post-1",
      title: "Launch post",
      app_id: "app-1",
      platform: "Instagram",
      due_date: "2026-09-10",
      status: "Planned",
      priority: "Normal",
      notes: null,
      content: null,
      created_at: "2026-09-07T00:00:00.000Z",
      updated_at: "2026-09-08T00:00:00.000Z",
    });

    expect(post).toEqual({
      id: "post-1",
      title: "Launch post",
      appId: "app-1",
      platform: "Instagram",
      dueDate: "2026-09-10",
      status: "Planned",
      priority: "Normal",
      notes: "",
      content: "",
      createdAt: "2026-09-07T00:00:00.000Z",
      updatedAt: "2026-09-08T00:00:00.000Z",
    });
  });

  it("prepares trimmed values for saving", () => {
    expect(
      toPostInsert({
        title: "  Launch post  ",
        appId: "app-1",
        platform: "Instagram",
        dueDate: "2026-09-10",
        status: "Planned",
        priority: "Normal",
        notes: " Film in the morning ",
        content: " See you there ",
      }),
    ).toEqual({
      title: "Launch post",
      app_id: "app-1",
      platform: "Instagram",
      due_date: "2026-09-10",
      status: "Planned",
      priority: "Normal",
      notes: "Film in the morning",
      content: "See you there",
    });
  });
});
