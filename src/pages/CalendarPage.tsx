import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarBoard } from "../components/CalendarBoard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PostFilters, PostQueryEmpty } from "../components/PostFilters";
import { QuickAddPost } from "../components/QuickAddPost";
import { SchedulePostList } from "../components/SchedulePostList";
import { useApps } from "../hooks/useApps";
import { usePersistedPostQuery } from "../hooks/usePersistedPostQuery";
import { usePosts } from "../hooks/usePosts";
import { useSettings } from "../hooks/useSettings";
import {
  CALENDAR_VIEWS,
  formatPeriodHeading,
  groupPostsByDueDate,
  shiftFocus,
  todayStamp,
  type CalendarView,
} from "../lib/calendarDate";
import { filterPosts, isPostQueryActive, type PostQuery } from "../lib/filterPosts";
import { logger } from "../lib/logger";
import { getPostSchedule } from "../lib/postSchedule";

// S-002: Calendar shows D-002 posts by day, week, or month.
export function CalendarPage() {
  const { posts, status, error, reload } = usePosts();
  const { getApp } = useApps();
  const { settings, status: settingsStatus, updateSettings } = useSettings();
  const { query, applyQuery: applyStoredQuery } = usePersistedPostQuery();
  const [view, setView] = useState<CalendarView>(settings.calendarView);
  const [focusDate, setFocusDate] = useState(() => todayStamp());
  const viewTouched = useRef(false);
  const today = todayStamp();
  const filteredPosts = useMemo(() => filterPosts(posts, query), [posts, query]);
  const postsByDate = useMemo(() => groupPostsByDueDate(filteredPosts), [filteredPosts]);
  const queryIsActive = isPostQueryActive(query);
  const schedule = useMemo(() => getPostSchedule(filteredPosts, today), [filteredPosts, today]);

  useEffect(() => {
    if (settingsStatus !== "ready" || viewTouched.current) {
      return;
    }

    logger.debug("Restored calendar view", { view: settings.calendarView });
    setView(settings.calendarView);
  }, [settings.calendarView, settingsStatus]);

  function applyQuery(nextQuery: PostQuery): void {
    applyStoredQuery(nextQuery);

    // A date filter should show that due date, so matching posts stay in view.
    if (nextQuery.dueDate) {
      setFocusDate(nextQuery.dueDate);
    }
  }

  function changeView(nextView: CalendarView): void {
    logger.debug("Calendar view changed", { view: nextView, focusDate });
    viewTouched.current = true;
    setView(nextView);
    updateSettings({ calendarView: nextView });
  }

  function movePeriod(direction: -1 | 1): void {
    const nextFocus = shiftFocus(focusDate, view, direction);
    logger.debug("Calendar period changed", { view, focusDate: nextFocus });
    setFocusDate(nextFocus);
  }

  return (
    <QuickAddPost
      defaultDueDate={focusDate}
      onAdded={(post) => {
        setFocusDate(post.dueDate);
      }}
    >
      {({ trigger, panel }) => (
        <section className="page">
          <PageHeader
            title="Calendar"
            description="See planned social media posts by day, week, or month."
            action={trigger}
          />

          {panel}

          {status === "loading" ? <LoadingState message="Loading posts…" /> : null}

          {status === "error" ? (
            <ErrorState
              message={error ?? "Posts could not be loaded. Please try again."}
              onRetry={() => {
                void reload();
              }}
            />
          ) : null}

          {status === "ready" ? (
            <>
              <PostFilters idPrefix="calendar-filter" query={query} onQueryChange={applyQuery} />

              {queryIsActive && filteredPosts.length === 0 ? <PostQueryEmpty query={query} /> : null}

              {!schedule.canCheckDates ? (
                <p className="schedule-unavailable" role="alert">
                  Overdue information is unavailable.
                </p>
              ) : null}

              {schedule.canCheckDates && schedule.overdue.length > 0 ? (
                <section className="schedule-panel">
                  <h2 className="schedule-panel__title">Overdue posts</h2>
                  <p className="schedule-panel__description">Posts whose due dates have passed.</p>
                  <SchedulePostList
                    posts={schedule.overdue}
                    getAppName={(appId) => getApp(appId)?.name ?? "Unknown app"}
                    listLabel="Overdue posts"
                    showOverdueLabel
                  />
                </section>
              ) : null}

              <div className="calendar-controls">
                <div className="toolbar" role="group" aria-label="Calendar view">
                  {CALENDAR_VIEWS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="toolbar__button"
                      aria-pressed={view === option}
                      onClick={() => changeView(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="toolbar" role="group" aria-label="Calendar period">
                  <button
                    type="button"
                    className="toolbar__button"
                    onClick={() => movePeriod(-1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="toolbar__button"
                    onClick={() => {
                      logger.debug("Calendar returned to today", { view });
                      setFocusDate(today);
                    }}
                  >
                    Today
                  </button>
                  <button type="button" className="toolbar__button" onClick={() => movePeriod(1)}>
                    Next
                  </button>
                </div>
              </div>

              <h2 className="calendar-heading">{formatPeriodHeading(focusDate, view)}</h2>

              <CalendarBoard
                view={view}
                focusDate={focusDate}
                today={today}
                postsByDate={postsByDate}
                showOverdue={schedule.canCheckDates}
                onSelectDate={(stamp) => {
                  logger.debug("Calendar day selected", { stamp });
                  setFocusDate(stamp);
                  changeView("Day");
                }}
              />
            </>
          ) : null}
        </section>
      )}
    </QuickAddPost>
  );
}
