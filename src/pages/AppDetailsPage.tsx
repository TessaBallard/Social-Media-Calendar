import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PostFlags } from "../components/PostFlags";
import { useApps } from "../hooks/useApps";
import { usePosts } from "../hooks/usePosts";
import { postsForApp } from "../lib/appPosts";
import { logger } from "../lib/logger";
import {
  appEditPath,
  postDetailsPath,
  postsNewForAppPath,
  ROUTES,
} from "../lib/routes";

// S-005 / F-016: App details and the stored posts that belong to that app.
export function AppDetailsPage() {
  const { appId } = useParams();
  const { getApp, status: appsStatus, error: appsError, reload: reloadApps } = useApps();
  const { posts, status: postsStatus, error: postsError, reload: reloadPosts } = usePosts();
  const app = appId ? getApp(appId) : undefined;
  const appPosts = useMemo(
    () => (appId ? postsForApp(posts, appId) : []),
    [appId, posts],
  );

  useEffect(() => {
    if (app) {
      logger.debug("Opened app details", { id: app.id, postCount: appPosts.length });
    }
  }, [app, appPosts.length]);

  if (appsStatus === "loading") {
    return (
      <section className="page">
        <PageHeader title="App" description="Loading this App Store app." />
        <LoadingState message="Loading app…" />
      </section>
    );
  }

  if (appsStatus === "error") {
    return (
      <section className="page">
        <PageHeader title="App" description="This App Store app could not be loaded." />
        <ErrorState
          message={appsError ?? "Apps could not be loaded. Please try again."}
          onRetry={() => {
            void reloadApps();
          }}
        />
      </section>
    );
  }

  if (!app) {
    return (
      <section className="page page--status">
        <PageHeader
          title="App not found"
          description="This app cannot be opened because it was not found."
        />
        <Link className="button" to={ROUTES.apps}>
          Back to Apps
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <PageHeader
        title={app.name}
        description="App details and the social media posts planned for this app."
        action={
          <div className="toolbar">
            <Link className="button button--secondary" to={appEditPath(app.id)}>
              Edit App
            </Link>
            <Link className="button" to={postsNewForAppPath(app.id)}>
              + Add Post
            </Link>
          </div>
        }
      />

      <p>
        <Link className="app-card__link" to={ROUTES.apps}>
          Back to Apps
        </Link>
      </p>

      <article className="post-details">
        <dl className="post-details__fields">
          <div>
            <dt>App Store link</dt>
            <dd>
              <a className="app-card__link" href={app.storeUrl} target="_blank" rel="noreferrer">
                {app.storeUrl}
              </a>
            </dd>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{app.notes ? app.notes : "No notes"}</dd>
          </div>
        </dl>
      </article>

      <section>
        <h2 className="schedule-panel__title">Posts for this app</h2>

        {postsStatus === "loading" ? <LoadingState message="Loading posts…" /> : null}

        {postsStatus === "error" ? (
          <ErrorState
            message={postsError ?? "Posts could not be loaded. Please try again."}
            onRetry={() => {
              void reloadPosts();
            }}
          />
        ) : null}

        {postsStatus === "ready" && appPosts.length === 0 ? (
          <EmptyState
            title="No posts for this app"
            description="Posts added for this app will appear here."
          />
        ) : null}

        {postsStatus === "ready" && appPosts.length > 0 ? (
          <ul className="app-list" aria-label={`Posts for ${app.name}`}>
            {appPosts.map((post) => (
              <li key={post.id}>
                <article className="app-card">
                  <div className="app-card__body">
                    <h3 className="app-card__title">
                      <Link className="app-card__title-link" to={postDetailsPath(post.id)}>
                        {post.title}
                      </Link>
                    </h3>
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
        ) : null}
      </section>
    </section>
  );
}
