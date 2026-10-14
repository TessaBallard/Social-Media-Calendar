import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  formatMonthHeading,
  formatTimelineHeading,
  formatWeekdayShort,
  getMonthGrid,
  getWeekDays,
  groupPostsByDueDate,
  shiftFocus,
  startOfWeek,
  toDateStamp,
} from "../src/lib/calendarDate";
import type { PostRecord } from "../src/types/postRecord";

describe("calendar dates", () => {
  it("keeps local calendar dates instead of UTC midnight", () => {
    expect(toDateStamp(new Date(2026, 8, 10, 0, 0, 0))).toBe("2026-09-10");
  });

  it("names weekdays for compact phone calendars", () => {
    expect(formatWeekdayShort("2026-10-13")).toMatch(/^Tue/);
  });

  it("starts weeks on Monday", () => {
    expect(startOfWeek("2026-09-10")).toBe("2026-09-07");
    expect(startOfWeek("2026-09-13")).toBe("2026-09-07");
    expect(getWeekDays("2026-09-10")).toEqual([
      "2026-09-07",
      "2026-09-08",
      "2026-09-09",
      "2026-09-10",
      "2026-09-11",
      "2026-09-12",
      "2026-09-13",
    ]);
  });

  it("builds a six-week month grid", () => {
    const grid = getMonthGrid("2026-09-10");

    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe("2026-08-31");
    expect(grid).toContain("2026-09-01");
    expect(grid).toContain("2026-09-30");
  });

  it("moves by day, week, and month without skipping short months", () => {
    expect(shiftFocus("2026-09-10", "Day", 1)).toBe("2026-09-11");
    expect(shiftFocus("2026-09-10", "Week", -1)).toBe("2026-09-03");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(shiftFocus("2026-09-10", "Month", 1)).toBe("2026-10-10");
  });

  it("formats a month heading", () => {
    expect(formatMonthHeading("2026-09-10")).toBe("September 2026");
  });

  it("labels today on the timeline heading", () => {
    expect(formatTimelineHeading("2026-09-10", "2026-09-10")).toBe(
      "Today · Thursday, 10 September 2026",
    );
    expect(formatTimelineHeading("2026-09-11", "2026-09-10")).toBe(
      "Friday, 11 September 2026",
    );
  });

  it("groups posts by due date", () => {
    const posts = [
      { id: "post-1", dueDate: "2026-09-10", title: "Launch post" },
      { id: "post-2", dueDate: "2026-09-10", title: "Second post" },
      { id: "post-3", dueDate: "2026-09-11", title: "Next day" },
    ] as PostRecord[];

    const grouped = groupPostsByDueDate(posts);

    expect(grouped.get("2026-09-10")?.map((post) => post.title)).toEqual([
      "Launch post",
      "Second post",
    ]);
    expect(grouped.get("2026-09-11")?.map((post) => post.title)).toEqual(["Next day"]);
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
  });
});
