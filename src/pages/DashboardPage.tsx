import { useMemo, type ReactNode } from "react";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { QuickAddPost } from "../components/QuickAddPost";
import { SchedulePostList } from "../components/SchedulePostList";
import { useApps } from "../hooks/useApps";
import { usePosts } from "../hooks/usePosts";
import { getDashboardSummary } from "../lib/postSchedule";
import type { PostRecord } from "../types/postRecord";

type SummaryCardProps = {
  title: string;
  description: string;
  listLabel: string;
  posts: PostRecord[];
  empty: string;
  getAppName: (appId: string) => string;
  alert?: string;
  showOverdueLabel?: boolean;
};

function emptyCopy(hasPosts: boolean, whenHasPosts: string): string {
  return hasPosts ? whenHasPosts : "Nothing to show yet.";
}

function SummaryCard({
  title,
  description,
  listLabel,
  posts,
  empty,
  getAppName,
  alert,
  showOverdueLabel,
}: SummaryCardProps) {
  return (
    <article className="summary-card">
      <h2 className="summary-card__title">{title}</h2>
      <p className="summary-card__description">{description}</p>
      {alert ? (
        <p className="summary-card__empty" role="alert">
          {alert}
        </p>
      ) : posts.length > 0 ? (
        <SchedulePostList
          posts={posts}
          getAppName={getAppName}
          listLabel={listLabel}
          showOverdueLabel={showOverdueLabel}
        />
      ) : (
        <p className="summary-card__empty">{empty}</p>
      )}
    </article>
  );
}

function CountItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <li>
      <span className="summary-strip__value">{value}</span>
      <span className="summary-strip__label">{label}</span>
    </li>
  );
}

// S-001 / F-013: Dashboard summary of stored social media posts.
export function DashboardPage() {
  const { posts, status, error, reload } = usePosts();
  const { getApp } = useApps();
  const summary = useMemo(() => getDashboardSummary(posts), [posts]);
  const hasPosts = posts.length > 0;

  function appName(appId: string): string {
    return getApp(appId)?.name ?? "Unknown app";
  }

  return (
    <QuickAddPost>
      {({ trigger, panel }) => (
        <section className="page">
          <PageHeader
            title="Dashboard"
            description="A quick summary of your social media plans."
            action={trigger}
          />

          {panel}

          {status === "loading" ? <LoadingState message="Loading posts…" /> : null}

          {status === "error" ? (
            <ErrorState
              message={error ?? "The dashboard summary could not be loaded."}
              onRetry={() => {
                void reload();
              }}
            />
          ) : null}

          {status === "ready" ? (
            <>
              <section className="summary-strip" role="region" aria-label="Summary of planned posts">
                <h2 className="summary-strip__title">Summary of planned posts</h2>
                <ul className="summary-strip__list">
                  <CountItem
                    label="Due soon"
                    value={summary.canCheckDates ? summary.dueSoon.length : "—"}
                  />
                  <CountItem
                    label="Overdue"
                    value={summary.canCheckDates ? summary.overdue.length : "—"}
                  />
                  <CountItem label="In progress" value={summary.inProgress.length} />
                  <CountItem label="Ready to post" value={summary.ready.length} />
                  <CountItem label="Recently posted" value={summary.recentlyPosted.length} />
                </ul>
              </section>

              <div className="card-grid">
                <SummaryCard
                  title="Upcoming posts"
                  description="Posts that are due next."
                  listLabel="Upcoming posts"
                  posts={summary.upcoming}
                  empty={emptyCopy(hasPosts, "No upcoming posts.")}
                  getAppName={appName}
                />
                <SummaryCard
                  title="Overdue posts"
                  description="Posts that still need attention."
                  listLabel="Overdue posts"
                  posts={summary.overdue}
                  empty={emptyCopy(hasPosts, "No overdue posts.")}
                  getAppName={appName}
                  alert={
                    summary.canCheckDates ? undefined : "Overdue information is unavailable."
                  }
                  showOverdueLabel
                />
                <SummaryCard
                  title="In progress"
                  description="Posts you are currently working on."
                  listLabel="Posts in progress"
                  posts={summary.inProgress}
                  empty={emptyCopy(hasPosts, "No posts in progress.")}
                  getAppName={appName}
                />
                <SummaryCard
                  title="Ready to post"
                  description="Posts that are ready to publish."
                  listLabel="Posts ready to publish"
                  posts={summary.ready}
                  empty={emptyCopy(hasPosts, "No posts ready to publish.")}
                  getAppName={appName}
                />
                <SummaryCard
                  title="Recently posted"
                  description="Posts that have already been published."
                  listLabel="Recently posted"
                  posts={summary.recentlyPosted}
                  empty={emptyCopy(hasPosts, "No recently posted items.")}
                  getAppName={appName}
                />
              </div>

              {hasPosts ? null : (
                <EmptyState
                  title="No planned posts yet"
                  description="Your dashboard summary will appear here once posts are added."
                />
              )}
            </>
          ) : null}
        </section>
      )}
    </QuickAddPost>
  );
}
