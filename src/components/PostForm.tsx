import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { logger } from "../lib/logger";
import { ROUTES } from "../lib/routes";
import { hasPostFormErrors, validatePostForm } from "../lib/validatePost";
import type { AppRecord } from "../types/appRecord";
import type { PostFormErrors, PostFormValues } from "../types/postRecord";
import {
  POST_PLATFORMS,
  POST_PRIORITIES,
  POST_STATUSES,
} from "../types/postRecord";

type PostFormProps = {
  initialValues: PostFormValues;
  apps: AppRecord[];
  submitLabel: string;
  formError?: string | null;
  onSubmit: (values: PostFormValues) => void | Promise<void>;
  onCancel: () => void;
};

type FieldName = keyof PostFormValues;

const FIELD_ERROR_IDS: Partial<Record<FieldName, string>> = {
  title: "post-title-error",
  appId: "post-app-error",
  platform: "post-platform-error",
  dueDate: "post-due-date-error",
  status: "post-status-error",
  priority: "post-priority-error",
};

// Shared Add/Edit Post form used by S-007.
export function PostForm({
  initialValues,
  apps,
  submitLabel,
  formError,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValues);
  const [errors, setErrors] = useState<PostFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const savedTrackedFields = useRef({
    platform: initialValues.platform,
    status: initialValues.status,
    priority: initialValues.priority,
  });

  function updateField(field: FieldName, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors = validatePostForm(values);
    setErrors(nextErrors);

    if (hasPostFormErrors(nextErrors)) {
      logger.debug("Post form failed validation", nextErrors);
      return;
    }

    logger.debug("Post form submitted", { title: values.title.trim() });
    setIsSubmitting(true);

    try {
      await onSubmit(values);
      savedTrackedFields.current = {
        platform: values.platform,
        status: values.status,
        priority: values.priority,
      };
    } catch {
      logger.debug("Keeping the current platform, status, and priority after a save error", {
        ...savedTrackedFields.current,
      });
      // On create, platform starts empty, so keep the user's selection after a save error.
      setValues((current) => ({
        ...current,
        platform: savedTrackedFields.current.platform || current.platform,
        status: savedTrackedFields.current.status,
        priority: savedTrackedFields.current.priority,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
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
        <label className="field__label" htmlFor="post-title">
          Post title
        </label>
        <input
          id="post-title"
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
        <label className="field__label" htmlFor="post-app">
          App
        </label>
        <select
          id="post-app"
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
        <label className="field__label" htmlFor="post-platform">
          Platform
        </label>
        <select
          id="post-platform"
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
        <label className="field__label" htmlFor="post-due-date">
          Due date
        </label>
        <input
          id="post-due-date"
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

      <div className="field">
        <label className="field__label" htmlFor="post-status">
          Status
        </label>
        <select
          id="post-status"
          name="status"
          className="field__select"
          value={values.status}
          onChange={(event) => updateField("status", event.target.value)}
          aria-invalid={Boolean(errors.status)}
          aria-describedby={errors.status ? FIELD_ERROR_IDS.status : undefined}
        >
          {POST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status ? (
          <p id={FIELD_ERROR_IDS.status} className="field__error">
            {errors.status}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="post-priority">
          Priority
        </label>
        <select
          id="post-priority"
          name="priority"
          className="field__select"
          value={values.priority}
          onChange={(event) => updateField("priority", event.target.value)}
          aria-invalid={Boolean(errors.priority)}
          aria-describedby={errors.priority ? FIELD_ERROR_IDS.priority : undefined}
        >
          {POST_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        {errors.priority ? (
          <p id={FIELD_ERROR_IDS.priority} className="field__error">
            {errors.priority}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="post-notes">
          Notes (optional)
        </label>
        <textarea
          id="post-notes"
          name="notes"
          className="field__textarea"
          rows={3}
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="post-content">
          Post content (optional)
        </label>
        <textarea
          id="post-content"
          name="content"
          className="field__textarea"
          rows={5}
          value={values.content}
          onChange={(event) => updateField("content", event.target.value)}
        />
      </div>

      <div className="form__actions">
        <button className="button" type="submit" disabled={isSubmitting || apps.length === 0}>
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
