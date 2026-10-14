import { useState, type FormEvent } from "react";
import type { AppFormErrors, AppFormValues } from "../types/appRecord";
import { hasAppFormErrors, validateAppForm } from "../lib/validateApp";
import { logger } from "../lib/logger";

type AppFormProps = {
  initialValues: AppFormValues;
  submitLabel: string;
  formError?: string | null;
  onSubmit: (values: AppFormValues) => void | Promise<void>;
  onCancel: () => void;
};

type FieldName = keyof AppFormValues;

const FIELD_ERROR_IDS: Partial<Record<FieldName, string>> = {
  name: "name-error",
  storeUrl: "store-url-error",
};

// Shared Add/Edit App form used by S-008.
export function AppForm({
  initialValues,
  submitLabel,
  formError,
  onSubmit,
  onCancel,
}: AppFormProps) {
  const [values, setValues] = useState<AppFormValues>(initialValues);
  const [errors, setErrors] = useState<AppFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: FieldName, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors = validateAppForm(values);
    setErrors(nextErrors);

    if (hasAppFormErrors(nextErrors)) {
      logger.debug("App form failed validation", nextErrors);
      return;
    }

    logger.debug("App form submitted", { name: values.name.trim() });
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <p className="form__error" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="field">
        <label className="field__label" htmlFor="app-name">
          App name
        </label>
        <input
          id="app-name"
          name="name"
          className="field__input"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? FIELD_ERROR_IDS.name : undefined}
        />
        {errors.name ? (
          <p id={FIELD_ERROR_IDS.name} className="field__error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="app-store-url">
          App Store link
        </label>
        <input
          id="app-store-url"
          name="storeUrl"
          type="url"
          className="field__input"
          value={values.storeUrl}
          onChange={(event) => updateField("storeUrl", event.target.value)}
          placeholder="https://apps.apple.com/"
          autoComplete="off"
          aria-invalid={Boolean(errors.storeUrl)}
          aria-describedby={errors.storeUrl ? FIELD_ERROR_IDS.storeUrl : undefined}
        />
        {errors.storeUrl ? (
          <p id={FIELD_ERROR_IDS.storeUrl} className="field__error">
            {errors.storeUrl}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="app-notes">
          Notes (optional)
        </label>
        <textarea
          id="app-notes"
          name="notes"
          className="field__textarea"
          rows={4}
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />
      </div>

      <div className="form__actions">
        <button className="button" type="submit" disabled={isSubmitting}>
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
