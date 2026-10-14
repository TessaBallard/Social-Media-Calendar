import { Link } from "react-router-dom";
import {
  formatDayHeading,
  formatDayNumber,
  formatWeekdayShort,
  getMonthGrid,
  getWeekDays,
  isSameMonth,
  WEEKDAY_LABELS,
  type CalendarView,
} from "../lib/calendarDate";
import { isOverduePost } from "../lib/postSchedule";
import { postDetailsPath } from "../lib/routes";
import type { PostRecord } from "../types/postRecord";

type CalendarBoardProps = {
  view: CalendarView;
  focusDate: string;
  today: string;
  postsByDate: Map<string, PostRecord[]>;
  showOverdue?: boolean;
  onSelectDate: (stamp: string) => void;
};

function dayClassName(
  stamp: string,
  today: string,
  focusDate: string,
  inMonth: boolean,
  hasOverdue: boolean,
): string {
  const classes = ["calendar-day"];

  if (!inMonth) {
    classes.push("calendar-day--muted");
  }

  if (stamp === today) {
    classes.push("calendar-day--today");
  }

  if (stamp === focusDate) {
    classes.push("calendar-day--focus");
  }

  if (hasOverdue) {
    classes.push("calendar-day--overdue");
  }

  return classes.join(" ");
}

function DayPosts({
  posts,
  today,
  showOverdue,
}: {
  posts: PostRecord[];
  today: string;
  showOverdue: boolean;
}) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <ul className="calendar-day__posts">
      {posts.map((post) => {
        const overdue = showOverdue && isOverduePost(post, today);

        return (
          <li key={post.id}>
            <Link
              className={overdue ? "calendar-post calendar-post--overdue" : "calendar-post"}
              to={postDetailsPath(post.id)}
            >
              {post.title}
            </Link>
            {overdue ? <span className="calendar-post__overdue">Overdue</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function DayCell({
  stamp,
  today,
  focusDate,
  inMonth,
  posts,
  showOverdue,
  onSelectDate,
}: {
  stamp: string;
  today: string;
  focusDate: string;
  inMonth: boolean;
  posts: PostRecord[];
  showOverdue: boolean;
  onSelectDate: (stamp: string) => void;
}) {
  const heading = formatDayHeading(stamp);
  const overdueCount = showOverdue ? posts.filter((post) => isOverduePost(post, today)).length : 0;
  const postCountLabel = `${posts.length} ${posts.length === 1 ? "post" : "posts"}`;
  const overdueLabel = overdueCount > 0 ? `, ${overdueCount} overdue` : "";

  return (
    <div className={dayClassName(stamp, today, focusDate, inMonth, overdueCount > 0)}>
      <div className="calendar-day__header">
        <span className="calendar-day__weekday">{formatWeekdayShort(stamp)}</span>
        <button
          type="button"
          className="calendar-day__number"
          aria-label={`${heading}, ${postCountLabel}${overdueLabel}`}
          aria-current={stamp === today ? "date" : undefined}
          onClick={() => onSelectDate(stamp)}
        >
          {formatDayNumber(stamp)}
        </button>
        {posts.length > 0 ? (
          <span className="calendar-day__count">{posts.length}</span>
        ) : null}
      </div>
      <DayPosts posts={posts} today={today} showOverdue={showOverdue} />
    </div>
  );
}

function WeekdayHeader() {
  return (
    <div className="calendar-weekdays" aria-hidden="true">
      {WEEKDAY_LABELS.map((label) => (
        <div key={label}>{label}</div>
      ))}
    </div>
  );
}

function DayView({
  posts,
  today,
  showOverdue,
}: {
  posts: PostRecord[];
  today: string;
  showOverdue: boolean;
}) {
  if (posts.length === 0) {
    return <p className="calendar-empty">No posts on this day.</p>;
  }

  return (
    <ul className="app-list">
      {posts.map((post) => {
        const overdue = showOverdue && isOverduePost(post, today);

        return (
          <li key={post.id}>
            <article className="app-card">
              <div className="app-card__body">
                {overdue ? <p className="post-overdue-label">Overdue</p> : null}
                <h2 className="app-card__title">
                  <Link className="app-card__title-link" to={postDetailsPath(post.id)}>
                    {post.title}
                  </Link>
                </h2>
                <p className="app-card__meta">
                  {post.platform} · Due {post.dueDate}
                </p>
              </div>
              <Link className="button button--secondary" to={postDetailsPath(post.id)}>
                View Post
              </Link>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

// Renders the selected day, week, or month of planned posts.
export function CalendarBoard({
  view,
  focusDate,
  today,
  postsByDate,
  showOverdue = true,
  onSelectDate,
}: CalendarBoardProps) {
  if (view === "Day") {
    return (
      <DayView
        posts={postsByDate.get(focusDate) ?? []}
        today={today}
        showOverdue={showOverdue}
      />
    );
  }

  const days = view === "Week" ? getWeekDays(focusDate) : getMonthGrid(focusDate);
  const emptyMessage = view === "Week" ? "No posts this week." : "No posts this month.";
  const hasPosts = days.some((stamp) => (postsByDate.get(stamp) ?? []).length > 0);

  return (
    <div
      className={view === "Week" ? "calendar-board calendar-board--week" : "calendar-board"}
      role="region"
      aria-label={`${view} calendar`}
    >
      <WeekdayHeader />
      <div className="calendar-grid">
        {days.map((stamp) => (
          <DayCell
            key={stamp}
            stamp={stamp}
            today={today}
            focusDate={focusDate}
            inMonth={view === "Week" || isSameMonth(stamp, focusDate)}
            posts={postsByDate.get(stamp) ?? []}
            showOverdue={showOverdue}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
      <p className="calendar-board__hint">Tap a day to see its posts.</p>
      {hasPosts ? null : <p className="calendar-empty">{emptyMessage}</p>}
    </div>
  );
}
