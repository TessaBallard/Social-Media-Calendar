import type { PostRecord } from "../types/postRecord";
import { addDays, isDateStamp, todayStamp } from "./calendarDate";
import { logger } from "./logger";

export const DUE_SOON_DAYS = 7;
export const RECENTLY_POSTED_LIMIT = 5;

function isOpenPost(post: PostRecord): boolean {
  return post.status !== "Posted" && post.status !== "Cancelled";
}

export function canCheckPostDates(posts: PostRecord[]): boolean {
  return posts.every((post) => isDateStamp(post.dueDate));
}

// F-012: Overdue posts are past their due date and not Posted or Cancelled.
export function isOverduePost(post: PostRecord, today = todayStamp()): boolean {
  return isDateStamp(post.dueDate) && isOpenPost(post) && post.dueDate < today;
}

// F-018: Upcoming posts are due today or later and still need to be published.
export function isUpcomingPost(post: PostRecord, today = todayStamp()): boolean {
  return isDateStamp(post.dueDate) && isOpenPost(post) && post.dueDate >= today;
}

function sortByDueDate(posts: PostRecord[]): PostRecord[] {
  return [...posts].sort((left, right) => {
    if (left.dueDate !== right.dueDate) {
      return left.dueDate < right.dueDate ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });
}

export function getPostSchedule(posts: PostRecord[], today = todayStamp()) {
  const datesOk = canCheckPostDates(posts);
  const overdue = sortByDueDate(posts.filter((post) => isOverduePost(post, today)));
  const upcoming = sortByDueDate(posts.filter((post) => isUpcomingPost(post, today)));

  logger.debug("Classified post schedule", {
    overdue: overdue.length,
    upcoming: upcoming.length,
    canCheckDates: datesOk,
  });

  return {
    canCheckDates: datesOk,
    overdue,
    upcoming,
  };
}

function sortByUpdatedAt(posts: PostRecord[]): PostRecord[] {
  return [...posts].sort((left, right) => {
    if (left.updatedAt !== right.updatedAt) {
      return right.updatedAt.localeCompare(left.updatedAt);
    }

    return right.dueDate.localeCompare(left.dueDate);
  });
}

// F-013: Dashboard summary buckets for due soon, status, and recent posts.
export function getDashboardSummary(posts: PostRecord[], today = todayStamp()) {
  const schedule = getPostSchedule(posts, today);
  const dueSoonEnd = addDays(today, DUE_SOON_DAYS);
  const dueSoon = schedule.upcoming.filter((post) => post.dueDate <= dueSoonEnd);
  const inProgress = sortByDueDate(posts.filter((post) => post.status === "In Progress"));
  const ready = sortByDueDate(posts.filter((post) => post.status === "Ready"));
  const recentlyPosted = sortByUpdatedAt(posts.filter((post) => post.status === "Posted")).slice(
    0,
    RECENTLY_POSTED_LIMIT,
  );

  logger.debug("Built dashboard summary", {
    dueSoon: dueSoon.length,
    inProgress: inProgress.length,
    ready: ready.length,
    recentlyPosted: recentlyPosted.length,
  });

  return {
    ...schedule,
    dueSoon,
    inProgress,
    ready,
    recentlyPosted,
  };
}
