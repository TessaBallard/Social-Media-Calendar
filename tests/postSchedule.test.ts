import { describe, expect, it } from "vitest";
import { isDateStamp } from "../src/lib/calendarDate";
import {
  getDashboardSummary,
  getPostSchedule,
  isOverduePost,
  isUpcomingPost,
} from "../src/lib/postSchedule";
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
    notes: "",
    content: "",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
    ...overrides,
  };
}

describe("B-013 post schedule", () => {
  const today = "2026-10-12";

  it("treats past open posts as overdue and today or later as upcoming", () => {
    const overdue = post({ id: "overdue", dueDate: "2026-10-11", status: "In Progress" });
    const todayPost = post({ id: "today", title: "Today post", dueDate: today });
    const later = post({ id: "later", title: "Later post", dueDate: "2026-10-13", status: "Ready" });

    expect(isOverduePost(overdue, today)).toBe(true);
    expect(isUpcomingPost(overdue, today)).toBe(false);
    expect(isOverduePost(todayPost, today)).toBe(false);
    expect(isUpcomingPost(todayPost, today)).toBe(true);
    expect(isUpcomingPost(later, today)).toBe(true);
  });

  it("does not treat Posted or Cancelled posts as overdue or upcoming", () => {
    const posted = post({ id: "posted", status: "Posted", dueDate: "2026-09-01" });
    const cancelled = post({ id: "cancelled", status: "Cancelled", dueDate: "2026-09-01" });

    expect(isOverduePost(posted, today)).toBe(false);
    expect(isOverduePost(cancelled, today)).toBe(false);
    expect(isUpcomingPost(posted, today)).toBe(false);
    expect(isUpcomingPost(cancelled, today)).toBe(false);
  });

  it("sorts overdue oldest first and upcoming next due first", () => {
    const schedule = getPostSchedule(
      [
        post({ id: "later", title: "Later", dueDate: "2026-10-20" }),
        post({ id: "older", title: "Older overdue", dueDate: "2026-08-01" }),
        post({ id: "newer", title: "Newer overdue", dueDate: "2026-09-01" }),
        post({ id: "soon", title: "Soon", dueDate: "2026-10-13" }),
      ],
      today,
    );

    expect(schedule.overdue.map((item) => item.id)).toEqual(["older", "newer"]);
    expect(schedule.upcoming.map((item) => item.id)).toEqual(["soon", "later"]);
  });

  it("says when a due date cannot be checked", () => {
    expect(isDateStamp("2026-10-12")).toBe(true);
    expect(isDateStamp("2026-02-31")).toBe(false);
    expect(isDateStamp("soon")).toBe(false);

    const schedule = getPostSchedule([post({ dueDate: "not-a-date" })], today);
    expect(schedule.canCheckDates).toBe(false);
    expect(schedule.overdue).toEqual([]);
    expect(schedule.upcoming).toEqual([]);
  });
});

describe("B-014 dashboard summary", () => {
  const today = "2026-10-12";

  it("groups due soon, in progress, ready, and recently posted posts", () => {
    const summary = getDashboardSummary(
      [
        post({ id: "soon", title: "Due soon", dueDate: "2026-10-15" }),
        post({ id: "later", title: "Later", dueDate: "2026-11-01" }),
        post({ id: "working", title: "Working", dueDate: "2026-10-11", status: "In Progress" }),
        post({ id: "ready", title: "Ready item", dueDate: "2026-10-20", status: "Ready" }),
        post({
          id: "old-posted",
          title: "Older posted",
          dueDate: "2026-09-01",
          status: "Posted",
          updatedAt: "2026-09-02T00:00:00.000Z",
        }),
        post({
          id: "new-posted",
          title: "Newer posted",
          dueDate: "2026-09-08",
          status: "Posted",
          updatedAt: "2026-10-01T00:00:00.000Z",
        }),
      ],
      today,
    );

    expect(summary.dueSoon.map((item) => item.id)).toEqual(["soon"]);
    expect(summary.upcoming.map((item) => item.id)).toEqual(["soon", "ready", "later"]);
    expect(summary.inProgress.map((item) => item.id)).toEqual(["working"]);
    expect(summary.ready.map((item) => item.id)).toEqual(["ready"]);
    expect(summary.recentlyPosted.map((item) => item.id)).toEqual(["new-posted", "old-posted"]);
  });

  it("keeps only the five most recently posted items", () => {
    const posted = Array.from({ length: 6 }, (_, index) =>
      post({
        id: `posted-${index}`,
        title: `Posted ${index}`,
        status: "Posted",
        updatedAt: `2026-10-0${index + 1}T00:00:00.000Z`,
      }),
    );

    expect(getDashboardSummary(posted, today).recentlyPosted.map((item) => item.id)).toEqual([
      "posted-5",
      "posted-4",
      "posted-3",
      "posted-2",
      "posted-1",
    ]);
  });
});
