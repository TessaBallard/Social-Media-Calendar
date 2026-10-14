import { useMemo } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PostFilters, PostQueryEmpty } from "../components/PostFilters";
import { PostFlags } from "../components/PostFlags";
import { SchedulePostList } from "../components/SchedulePostList";
import { useApps } from "../hooks/useApps";
import { usePersistedPostQuery } from "../hooks/usePersistedPostQuery";
import { usePosts } from "../hooks/usePosts";
import { formatTimelineHeading, groupPostsByDueDate, todayStamp } from "../lib/calendarDate";
import { filterPosts, isPostQueryActive } from "../lib/filterPosts";
import { getPostSchedule } from "../lib/postSchedule";
import { postDetailsPath, ROUTES } from "../lib/routes";

// S-003: Timeline shows D-002 posts grouped by due date.
export function TimelinePage() {
  const { posts, status, error, reload } = usePosts();
  const { getApp } = useApps();
  const { query, applyQuery } = usePersistedPostQuery();
  const today = todayStamp();
  const filteredPosts = useMemo(() => filterPosts(posts, query), [posts, query]);
  const postsByDate = useMemo(() => groupPostsByDueDate(filteredPosts), [filteredPosts]);
  const dates = [...postsByDate.keys()];
  const queryIsActive = isPostQueryActive(query);
  const schedule = useMemo(() => getPostSchedule(filteredPosts, today), [filteredPosts, today]);

  function appName(appId: string): string {
    return getApp(appId)?.name ?? "Unknown app";
  }

  return (
    <section className="page">
      <PageHeader
        title="Timeline"
        description="Upcoming work in date order, so you can see what is coming next."
        action={
          <Link className="button" to={ROUTES.postsNew}>
            + Add Post
          </Link>
        }
      />

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
        <PostFilters idPrefix="timeline-filter" query={query} onQueryChange={applyQuery} />
      ) : null}

      {status === "ready" && !schedule.canCheckDates ? (
        <p className="schedule-unavailable" role="alert">
          Overdue information is unavailable.
        </p>
      ) : null}

      {status === "ready" && queryIsActive && filteredPosts.length === 0 ? (
        <PostQueryEmpty query={query} />
      ) : null}

      {status === "ready" && schedule.canCheckDates && schedule.overdue.length > 0 ? (
        <section className="schedule-panel">
          <h2 className="schedule-panel__title">Overdue posts</h2>
          <p className="schedule-panel__description">Posts whose due dates have passed.</p>
          <SchedulePostList
            posts={schedule.overdue}
            getAppName={appName}
            listLabel="Overdue posts"
            showOverdueLabel
          />
        </section>
      ) : null}

      {status === "ready" && schedule.upcoming.length > 0 ? (
        <section className="schedule-panel">
          <h2 className="schedule-panel__title">Upcoming posts</h2>
          <p className="schedule-panel__description">The next posts that are due.</p>
          <SchedulePostList
            posts={schedule.upcoming}
            getAppName={appName}
            listLabel="Upcoming posts"
          />
        </section>
      ) : null}

      {status === "ready" && !queryIsActive && posts.length === 0 ? (
        <EmptyState
          title="No posts on the timeline"
          description="Upcoming and overdue posts will appear here in date order."
        />
      ) : null}

      {status === "ready" && filteredPosts.length > 0 ? (
        <ol className="timeline" aria-label="Posts in date order">
          {dates.map((date) => (
            <li key={date} className="timeline__day">
              <h2
                className={
                  date === today ? "timeline__date timeline__date--today" : "timeline__date"
                }
              >
                {formatTimelineHeading(date, today)}
              </h2>
              <ul className="app-list">
                {(postsByDate.get(date) ?? []).map((post) => (
                  <li key={post.id}>
                    <article className="app-card">
                      <div className="app-card__body">
                        <h3 className="app-card__title">
                          <Link className="app-card__title-link" to={postDetailsPath(post.id)}>
                            {post.title}
                          </Link>
                        </h3>
                        <p className="app-card__meta">
                          {getApp(post.appId)?.name ?? "Unknown app"}
                        </p>
                        <p className="app-card__meta">Due {post.dueDate}</p>
                        <PostFlags
                          platform={post.platform}
                          status={post.status}
                          priority={post.priority}
                        />
                      </div>
                      <Link className="button button--secondary" to={postDetailsPath(post.id)}>
                        View Post
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
