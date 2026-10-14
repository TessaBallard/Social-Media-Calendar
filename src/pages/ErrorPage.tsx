import { Link } from "react-router-dom";
import { ROUTES } from "../lib/routes";

// General error page used by the error route and the error boundary.
export function ErrorPage() {
  return (
    <section className="page page--status">
      <p className="status-kicker">Something went wrong</p>
      <h1 className="page-header__title">The app hit a problem</h1>
      <p className="page-header__description">
        Please try again. If the problem continues, return to the dashboard and
        start over.
      </p>
      <Link className="button" to={ROUTES.dashboard}>
        Back to Dashboard
      </Link>
    </section>
  );
}
