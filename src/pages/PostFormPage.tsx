import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PostForm } from "../components/PostForm";
import { useApps } from "../hooks/useApps";
import { usePosts } from "../hooks/usePosts";
import { logger } from "../lib/logger";
import { getPostFieldSaveError } from "../lib/postSaveError";
import { appDetailsPath, postDetailsPath, ROUTES } from "../lib/routes";
import { toPostFormValues } from "../services/postsService";
import { EMPTY_POST_FORM, type PostFormValues } from "../types/postRecord";

function toSaveErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "This post could not be saved. Please try again.";
}

// S-007: Add / Edit Post form page.
export function PostFormPage() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { apps, status: appsStatus } = useApps();
  const { getPost, addPost, updatePost, status, error, reload } = usePosts();
  const [formError, setFormError] = useState<string | null>(null);

  const existingPost = postId ? getPost(postId) : undefined;
  const isEdit = Boolean(postId);
  const presetAppId = searchParams.get("appId") ?? "";
  const presetAppExists = apps.some((app) => app.id === presetAppId);

  function goAfterCancel(): void {
    if (isEdit && postId) {
      navigate(postDetailsPath(postId));
      return;
    }

    navigate(presetAppExists ? appDetailsPath(presetAppId) : ROUTES.timeline);
  }

  async function handleSubmit(values: PostFormValues): Promise<void> {
    try {
      if (isEdit && postId) {
        await updatePost(postId, values);
        setFormError(null);
        navigate(postDetailsPath(postId));
        return;
      }

      await addPost(values);
      setFormError(null);
      navigate(presetAppExists ? appDetailsPath(values.appId) : ROUTES.timeline);
    } catch (saveError) {
      logger.error("Post could not be saved", saveError);
      // Keep the saved platform, status, and priority when those fields cannot be stored.
      const fieldSaveMessage = isEdit ? getPostFieldSaveError(values, existingPost) : null;
      setFormError(fieldSaveMessage ?? toSaveErrorMessage(saveError));
      throw saveError;
    }
  }

  if (isEdit && status === "loading") {
    return (
      <section className="page">
        <PageHeader title="Edit Post" description="Loading this social media post." />
        <LoadingState message="Loading post…" />
      </section>
    );
  }

  if (isEdit && status === "error") {
    return (
      <section className="page">
        <PageHeader
          title="Edit Post"
          description="This social media post could not be loaded."
        />
        <ErrorState
          message={error ?? "Posts could not be loaded. Please try again."}
          onRetry={() => {
            void reload();
          }}
        />
      </section>
    );
  }

  if (isEdit && !existingPost) {
    return (
      <section className="page page--status">
        <PageHeader
          title="Post not found"
          description="This post cannot be edited because it was not found."
        />
        <Link className="button" to={ROUTES.timeline}>
          Back to Timeline
        </Link>
      </section>
    );
  }

  const initialValues = existingPost
    ? toPostFormValues(existingPost)
    : {
        ...EMPTY_POST_FORM,
        appId: presetAppExists ? presetAppId : apps.length === 1 ? apps[0].id : "",
      };

  return (
    <section className="page">
      <PageHeader
        title={isEdit ? "Edit Post" : "Add Post"}
        description={
          isEdit
            ? "Update the planned social media post."
            : "Plan a social media post for one of your App Store apps."
        }
      />

      {appsStatus === "loading" ? (
        <LoadingState message="Loading apps…" />
      ) : (
        <PostForm
          key={existingPost?.id ?? `new-post-${apps.map((app) => app.id).join("-")}`}
          initialValues={initialValues}
          apps={apps}
          submitLabel={isEdit ? "Save changes" : "Add Post"}
          formError={formError}
          onSubmit={handleSubmit}
          onCancel={goAfterCancel}
        />
      )}
    </section>
  );
}
