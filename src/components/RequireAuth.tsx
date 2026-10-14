import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../lib/routes";
import { LoadingState } from "./LoadingState";

// Users cannot use the planner without an account.
export function RequireAuth() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <section className="page page--status">
        <LoadingState message="Checking your account…" />
      </section>
    );
  }

  if (!user) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`${ROUTES.signIn}?from=${encodeURIComponent(from)}`} replace />;
  }

  return <Outlet />;
}
