import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppForm } from "../components/AppForm";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useApps } from "../hooks/useApps";
import { logger } from "../lib/logger";
import { appDetailsPath, ROUTES } from "../lib/routes";
import { toAppFormValues } from "../services/appsService";
import { EMPTY_APP_FORM, type AppFormValues } from "../types/appRecord";

function toSaveErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "This app could not be saved. Please try again.";
}

// S-008: Add / Edit App form page.
export function AppFormPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { getApp, addApp, updateApp, status, error, reload } = useApps();
  const [formError, setFormError] = useState<string | null>(null);

  const existingApp = appId ? getApp(appId) : undefined;
  const isEdit = Boolean(appId);

  function goAfterCancel(): void {
    navigate(isEdit && appId ? appDetailsPath(appId) : ROUTES.apps);
  }

  async function handleSubmit(values: AppFormValues): Promise<void> {
    try {
      if (isEdit && appId) {
        await updateApp(appId, values);
        setFormError(null);
        navigate(appDetailsPath(appId));
        return;
      }

      await addApp(values);
      setFormError(null);
      navigate(ROUTES.apps);
    } catch (saveError) {
      logger.error("App could not be saved", saveError);
      setFormError(toSaveErrorMessage(saveError));
    }
  }

  if (isEdit && status === "loading") {
    return (
      <section className="page">
        <PageHeader title="Edit App" description="Loading this App Store app." />
        <LoadingState message="Loading app…" />
      </section>
    );
  }

  if (isEdit && status === "error") {
    return (
      <section className="page">
        <PageHeader
          title="Edit App"
          description="This App Store app could not be loaded."
        />
        <ErrorState
          message={error ?? "Apps could not be loaded. Please try again."}
          onRetry={() => {
            void reload();
          }}
        />
      </section>
    );
  }

  if (isEdit && !existingApp) {
    return (
      <section className="page page--status">
        <PageHeader
          title="App not found"
          description="This app cannot be edited because it was not found."
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
        title={isEdit ? "Edit App" : "Add App"}
        description={
          isEdit
            ? "Update the App Store app details."
            : "Add an App Store app so you can organise posts by app."
        }
      />

      <AppForm
        key={existingApp?.id ?? "new-app"}
        initialValues={existingApp ? toAppFormValues(existingApp) : EMPTY_APP_FORM}
        submitLabel={isEdit ? "Save changes" : "Add App"}
        formError={formError}
        onSubmit={handleSubmit}
          onCancel={goAfterCancel}
      />
    </section>
  );
}
