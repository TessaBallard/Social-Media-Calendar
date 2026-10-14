import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useApps } from "../hooks/useApps";
import { usePosts } from "../hooks/usePosts";
import { plannedPostsLabel, postsForApp } from "../lib/appPosts";
import { appDetailsPath, appEditPath, ROUTES } from "../lib/routes";

// S-004: Apps lists the user's App Store apps and starts F-001 Add App.
export function AppsPage() {
  const { apps, status, error, reload } = useApps();
  const { posts, status: postsStatus } = usePosts();

  function plannedPostsMeta(appId: string): string {
    if (postsStatus === "error") {
      return "Planned posts unavailable.";
    }

    if (postsStatus !== "ready") {
      return "Counting posts…";
    }

    return plannedPostsLabel(postsForApp(posts, appId).length);
  }

  return (
    <section className="page">
      <PageHeader
        title="Apps"
        description="Organise social media posts by the App Store apps they belong to."
        action={
          <Link className="button" to={ROUTES.appsNew}>
            + Add App
          </Link>
        }
      />

      {status === "loading" ? <LoadingState message="Loading apps…" /> : null}

      {status === "error" ? (
        <ErrorState
          message={error ?? "Apps could not be loaded. Please try again."}
          onRetry={() => {
            void reload();
          }}
        />
      ) : null}

      {status === "ready" && apps.length === 0 ? (
        <EmptyState
          title="No apps yet"
          description="Your App Store apps will appear here once they are added."
        />
      ) : null}

      {status === "ready" && apps.length > 0 ? (
        <ul className="app-list">
          {apps.map((app) => (
            <li key={app.id}>
              <article className="app-card">
                <div className="app-card__body">
                  <h2 className="app-card__title">
                    <Link className="app-card__title-link" to={appDetailsPath(app.id)}>
                      {app.name}
                    </Link>
                  </h2>
                  <a
                    className="app-card__link"
                    href={app.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {app.storeUrl}
                  </a>
                  {app.notes ? <p className="app-card__notes">{app.notes}</p> : null}
                  <p className="app-card__meta">{plannedPostsMeta(app.id)}</p>
                </div>
                <Link className="button button--secondary" to={appEditPath(app.id)}>
                  Edit App
                </Link>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
