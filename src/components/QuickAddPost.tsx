import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useApps } from "../hooks/useApps";
import { usePosts } from "../hooks/usePosts";
import { todayStamp } from "../lib/calendarDate";
import { logger } from "../lib/logger";
import { postDetailsPath, ROUTES } from "../lib/routes";
import { hasPostFormErrors, validatePostForm } from "../lib/validatePost";
import {
  EMPTY_POST_FORM,
  POST_PLATFORMS,
  type PostFormErrors,
  type PostFormValues,
  type PostRecord,
} from "../types/postRecord";

type FieldName = "title" | "appId" | "platform" | "dueDate";

const FIELD_ERROR_IDS: Record<FieldName, string> = {
  title: "quick-add-title-error",
  appId: "quick-add-app-error",
  platform: "quick-add-platform-error",
  dueDate: "quick-add-due-date-error",
};

type QuickAddPostProps = {
  defaultDueDate?: string;
  onAdded?: (post: PostRecord) => void;
  children: (parts: { trigger: ReactNode; panel: ReactNode }) => ReactNode;
};

function toSaveErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "This post could not be saved. Please try again.";
}

// F-017: Create a post from Dashboard or Calendar without leaving the page.
export function QuickAddPost({ defaultDueDate, onAdded, children }: QuickAddPostProps) {
  const { apps } = useApps();
  const { addPost } = usePosts();
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<PostFormValues>(EMPTY_POST_FORM);
  const [errors, setErrors] = useState<PostFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedPost, setAddedPost] = useState<PostRecord | null>(null);

  function emptyValues(): PostFormValues {
    return {
      ...EMPTY_POST_FORM,
      appId: apps.length === 1 ? apps[0].id : "",
      dueDate: defaultDueDate ?? todayStamp(),
    };
  }

  function open(): void {
    logger.debug("Quick add opened");
    setValues(emptyValues());
    setErrors({});
    setFormError(null);
    setAddedPost(null);
    setIsOpen(true);
  }

  function close(): void {
    setIsOpen(false);
    setErrors({});
    setFormError(null);
  }

  function updateField(field: FieldName, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors = validatePostForm(values);
    setErrors(nextErrors);

    if (hasPostFormErrors(nextErrors)) {
      logger.debug("Quick add failed validation", nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const post = await addPost(values);
      logger.debug("Quick add saved", { id: post.id, title: post.title });
      close();
      setAddedPost(post);
      onAdded?.(post);
    } catch (saveError) {
      logger.error("Quick add could not save", saveError);
      setFormError(toSaveErrorMessage(saveError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const trigger = (
    <button
      type="button"
      className="button"
      onClick={open}
      aria-expanded={isOpen}
      aria-controls="quick-add-form"
    >
      + Add Post
    </button>
  );

  const panel = (
    <>
      {addedPost && !isOpen ? (
        <p
          className="quick-add__success"
          role="status"
          aria-label={`${addedPost.title} was added.`}
        >
          {addedPost.title} was added.{" "}
          <Link className="quick-add__success-link" to={postDetailsPath(addedPost.id)}>
            View Post
          </Link>
        </p>
      ) : null}

      {isOpen ? (
        <form
          id="quick-add-form"
          className="form"
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="quick-add-heading"
        >
          <h2 id="quick-add-heading" className="quick-add__title">
            Quick add
          </h2>
          <p className="quick-add__description">
            Add a planned post here without leaving this page.
          </p>

          {apps.length === 0 ? (
            <p className="form__error" role="status">
              Add an App Store app before you create a post.{" "}
              <Link to={ROUTES.appsNew}>+ Add App</Link>
            </p>
          ) : null}

          {formError ? (
            <p className="form__error" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="field">
            <label className="field__label" htmlFor="quick-add-title">
              Post title
            </label>
            <input
              id="quick-add-title"
              name="title"
              className="field__input"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? FIELD_ERROR_IDS.title : undefined}
            />
            {errors.title ? (
              <p id={FIELD_ERROR_IDS.title} className="field__error">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="quick-add-app">
              App
            </label>
            <select
              id="quick-add-app"
              name="appId"
              className="field__select"
              value={values.appId}
              onChange={(event) => updateField("appId", event.target.value)}
              aria-invalid={Boolean(errors.appId)}
              aria-describedby={errors.appId ? FIELD_ERROR_IDS.appId : undefined}
            >
              <option value="">Select an app</option>
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
            {errors.appId ? (
              <p id={FIELD_ERROR_IDS.appId} className="field__error">
                {errors.appId}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="quick-add-platform">
              Platform
            </label>
            <select
              id="quick-add-platform"
              name="platform"
              className="field__select"
              value={values.platform}
              onChange={(event) => updateField("platform", event.target.value)}
              aria-invalid={Boolean(errors.platform)}
              aria-describedby={errors.platform ? FIELD_ERROR_IDS.platform : undefined}
            >
              <option value="">Select a platform</option>
              {POST_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            {errors.platform ? (
              <p id={FIELD_ERROR_IDS.platform} className="field__error">
                {errors.platform}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="quick-add-due-date">
              Due date
            </label>
            <input
              id="quick-add-due-date"
              name="dueDate"
              type="date"
              className="field__input"
              value={values.dueDate}
              onChange={(event) => updateField("dueDate", event.target.value)}
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? FIELD_ERROR_IDS.dueDate : undefined}
            />
            {errors.dueDate ? (
              <p id={FIELD_ERROR_IDS.dueDate} className="field__error">
                {errors.dueDate}
              </p>
            ) : null}
          </div>

          <div className="form__actions">
            <button className="button" type="submit" disabled={isSubmitting || apps.length === 0}>
              {isSubmitting ? "Saving…" : "Add Post"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </>
  );

  return children({ trigger, panel });
}
