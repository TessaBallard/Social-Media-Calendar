import type { AppFormErrors, AppFormValues } from "../types/appRecord";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Checks the Add/Edit App form before anything is saved.
export function validateAppForm(values: AppFormValues): AppFormErrors {
  const errors: AppFormErrors = {};
  const name = values.name.trim();
  const storeUrl = values.storeUrl.trim();

  if (!name) {
    errors.name = "Enter an app name.";
  }

  if (!storeUrl) {
    errors.storeUrl = "Enter an App Store link.";
  } else if (!isHttpUrl(storeUrl)) {
    errors.storeUrl = "Enter a valid App Store link, including https://.";
  }

  return errors;
}

export function hasAppFormErrors(errors: AppFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
