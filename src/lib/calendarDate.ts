import type { PostRecord } from "../types/postRecord";

export const CALENDAR_VIEWS = ["Day", "Week", "Month"] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Uses local calendar dates so a due date of 2026-09-10 stays on 10 September.
export function toDateStamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateStamp(stamp: string): Date {
  const [year, month, day] = stamp.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isDateStamp(stamp: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp)) {
    return false;
  }

  return toDateStamp(fromDateStamp(stamp)) === stamp;
}

export function todayStamp(now = new Date()): string {
  return toDateStamp(now);
}

export function addDays(stamp: string, days: number): string {
  const date = fromDateStamp(stamp);
  date.setDate(date.getDate() + days);
  return toDateStamp(date);
}

export function startOfMonth(stamp: string): string {
  const date = fromDateStamp(stamp);
  date.setDate(1);
  return toDateStamp(date);
}

export function startOfWeek(stamp: string): string {
  const date = fromDateStamp(stamp);
  const weekday = date.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + mondayOffset);
  return toDateStamp(date);
}

export function addMonths(stamp: string, months: number): string {
  const date = fromDateStamp(stamp);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toDateStamp(date);
}

export function shiftFocus(stamp: string, view: CalendarView, direction: -1 | 1): string {
  if (view === "Day") {
    return addDays(stamp, direction);
  }

  if (view === "Week") {
    return addDays(stamp, direction * 7);
  }

  return addMonths(stamp, direction);
}

export function getWeekDays(stamp: string): string[] {
  const start = startOfWeek(stamp);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getMonthGrid(stamp: string): string[] {
  const start = startOfWeek(startOfMonth(stamp));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function isSameMonth(left: string, right: string): boolean {
  return left.slice(0, 7) === right.slice(0, 7);
}

export function formatDayNumber(stamp: string): string {
  return String(fromDateStamp(stamp).getDate());
}

export function formatWeekdayShort(stamp: string): string {
  return fromDateStamp(stamp).toLocaleDateString("en-NZ", { weekday: "short" });
}

export function formatDayHeading(stamp: string): string {
  return fromDateStamp(stamp).toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimelineHeading(stamp: string, today = todayStamp()): string {
  const heading = formatDayHeading(stamp);
  return stamp === today ? `Today · ${heading}` : heading;
}

export function formatWeekHeading(stamp: string): string {
  const days = getWeekDays(stamp);
  const start = fromDateStamp(days[0]);
  const end = fromDateStamp(days[6]);
  const endLabel = end.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${endLabel}`;
  }

  const startLabel = start.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
  });
  return `${startLabel} – ${endLabel}`;
}

export function formatMonthHeading(stamp: string): string {
  return fromDateStamp(stamp).toLocaleDateString("en-NZ", {
    month: "long",
    year: "numeric",
  });
}

export function formatPeriodHeading(stamp: string, view: CalendarView): string {
  if (view === "Day") {
    return formatDayHeading(stamp);
  }

  if (view === "Week") {
    return formatWeekHeading(stamp);
  }

  return formatMonthHeading(stamp);
}

export function groupPostsByDueDate(posts: PostRecord[]): Map<string, PostRecord[]> {
  const grouped = new Map<string, PostRecord[]>();

  for (const post of posts) {
    const existing = grouped.get(post.dueDate) ?? [];
    existing.push(post);
    grouped.set(post.dueDate, existing);
  }

  return grouped;
}
