import { Link } from "react-router-dom";
import { ROUTES } from "../lib/routes";

// Shown when the user visits a URL that does not match a known page.
export function NotFoundPage() {
  return (
    <section className="page page--status">
      <p className="status-kicker">404</p>
      <h1 className="page-header__title">Page not found</h1>
      <p className="page-header__description">
        That page does not exist. Use the link below to return to the dashboard.
      </p>
      <Link className="button" to={ROUTES.dashboard}>
        Back to Dashboard
      </Link>
    </section>
  );
}
