import { Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import {
  APP_DETAILS_PATH,
  APP_EDIT_PATH,
  POST_DETAILS_PATH,
  POST_EDIT_PATH,
  ROUTES,
} from "../lib/routes";
import { AppDetailsPage } from "../pages/AppDetailsPage";
import { AppFormPage } from "../pages/AppFormPage";
import { AppsPage } from "../pages/AppsPage";
import { CalendarPage } from "../pages/CalendarPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ErrorPage } from "../pages/ErrorPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PostDetailsPage } from "../pages/PostDetailsPage";
import { PostFormPage } from "../pages/PostFormPage";
import { SignInPage } from "../pages/SignInPage";
import { TimelinePage } from "../pages/TimelinePage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

type AppRoutesProps = {
  requireAuth: ReactElement;
  authenticated: ReactElement;
};

// Public sign-in plus protected planner screens for one signed-in account.
export function AppRoutes({ requireAuth, authenticated }: AppRoutesProps) {
  return (
    <Routes>
      <Route path={ROUTES.signIn} element={<SignInPage />} />
      <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />
      <Route element={requireAuth}>
        <Route element={authenticated}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.calendar} element={<CalendarPage />} />
          <Route path={ROUTES.timeline} element={<TimelinePage />} />
          <Route path={ROUTES.apps} element={<AppsPage />} />
          <Route path={ROUTES.appsNew} element={<AppFormPage />} />
          <Route path={APP_EDIT_PATH} element={<AppFormPage />} />
          <Route path={APP_DETAILS_PATH} element={<AppDetailsPage />} />
          <Route path={ROUTES.postsNew} element={<PostFormPage />} />
          <Route path={POST_EDIT_PATH} element={<PostFormPage />} />
          <Route path={POST_DETAILS_PATH} element={<PostDetailsPage />} />
          <Route path={ROUTES.error} element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
