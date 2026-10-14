import { describe, expect, it } from "vitest";
import { hasPostFormErrors, validatePostForm } from "../src/lib/validatePost";
import { EMPTY_POST_FORM } from "../src/types/postRecord";

describe("validatePostForm", () => {
  it("requires a title, app, platform, and due date", () => {
    const errors = validatePostForm(EMPTY_POST_FORM);

    expect(errors.title).toBe("Enter a post title.");
    expect(errors.appId).toBe("Select an app.");
    expect(errors.platform).toBe("Select a social media platform.");
    expect(errors.dueDate).toBe("Enter a due date.");
    expect(hasPostFormErrors(errors)).toBe(true);
  });

  it("allows notes and post content to be empty", () => {
    const errors = validatePostForm({
      title: "Launch post",
      appId: "app-1",
      platform: "Instagram",
      dueDate: "2026-09-10",
      status: "Planned",
      priority: "Normal",
      notes: "",
      content: "",
    });

    expect(errors).toEqual({});
    expect(hasPostFormErrors(errors)).toBe(false);
  });

  it("rejects an invalid due date", () => {
    const errors = validatePostForm({
      title: "Launch post",
      appId: "app-1",
      platform: "Instagram",
      dueDate: "10-09-2026",
      status: "Planned",
      priority: "Normal",
      notes: "",
      content: "",
    });

    expect(errors.dueDate).toBe("Enter a valid due date.");
  });

  it("rejects an invalid status or priority", () => {
    const errors = validatePostForm({
      title: "Launch post",
      appId: "app-1",
      platform: "Instagram",
      dueDate: "2026-09-10",
      status: "Done",
      priority: "Critical",
      notes: "",
      content: "",
    });

    expect(errors.status).toBe("Select a status.");
    expect(errors.priority).toBe("Select a priority.");
  });

  it("rejects an invalid social media platform", () => {
    const errors = validatePostForm({
      title: "Launch post",
      appId: "app-1",
      platform: "Snapchat",
      dueDate: "2026-09-10",
      status: "Planned",
      priority: "Normal",
      notes: "",
      content: "",
    });

    expect(errors.platform).toBe("Select a valid social media platform.");
  });
});
