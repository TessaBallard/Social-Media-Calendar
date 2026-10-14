import { Navigate } from "react-router-dom";
import { ROUTES } from "../lib/routes";

// Older links to /unauthorized now go to sign-in.
export function UnauthorizedPage() {
  return <Navigate to={ROUTES.signIn} replace />;
}
