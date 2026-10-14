// Shared route paths used by navigation and the router.
export const ROUTES = {
  dashboard: "/",
  calendar: "/calendar",
  timeline: "/timeline",
  apps: "/apps",
  appsNew: "/apps/new",
  postsNew: "/posts/new",
  signIn: "/sign-in",
  unauthorized: "/unauthorized",
  error: "/error",
} as const;

export const APP_DETAILS_PATH = "/apps/:appId";
export const APP_EDIT_PATH = "/apps/:appId/edit";
export const POST_DETAILS_PATH = "/posts/:postId";
export const POST_EDIT_PATH = "/posts/:postId/edit";

export function appDetailsPath(appId: string): string {
  return `/apps/${appId}`;
}

export function appEditPath(appId: string): string {
  return `/apps/${appId}/edit`;
}

export function postsNewForAppPath(appId: string): string {
  return `${ROUTES.postsNew}?appId=${encodeURIComponent(appId)}`;
}

export function postDetailsPath(postId: string): string {
  return `/posts/${postId}`;
}

export function postEditPath(postId: string): string {
  return `/posts/${postId}/edit`;
}

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export type NavItem = {
  label: string;
  path: AppRoute;
  screenId: "S-001" | "S-002" | "S-003" | "S-004";
};

// Primary navigation for B-001: Dashboard, Calendar, Timeline, and Apps.
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: ROUTES.dashboard, screenId: "S-001" },
  { label: "Calendar", path: ROUTES.calendar, screenId: "S-002" },
  { label: "Timeline", path: ROUTES.timeline, screenId: "S-003" },
  { label: "Apps", path: ROUTES.apps, screenId: "S-004" },
];
