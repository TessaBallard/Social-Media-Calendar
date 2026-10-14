import { ROUTES } from "./routes";

// Only send signed-in users to a path inside this app.
export function safeReturnPath(from: string | null | undefined): string {
  if (
    from &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    !from.startsWith(ROUTES.signIn)
  ) {
    return from;
  }

  return ROUTES.dashboard;
}
