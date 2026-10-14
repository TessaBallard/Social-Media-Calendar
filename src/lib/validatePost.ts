import type { PostFormErrors, PostFormValues } from "../types/postRecord";
import {
  POST_PLATFORMS,
  POST_PRIORITIES,
  POST_STATUSES,
} from "../types/postRecord";

function isValueInList(value: string, list: readonly string[]): boolean {
  return list.includes(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

// Checks the Add/Edit Post form before anything is saved.
export function validatePostForm(values: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Enter a post title.";
  }

  if (!values.appId) {
    errors.appId = "Select an app.";
  }

  if (!values.platform) {
    errors.platform = "Select a social media platform.";
  } else if (!isValueInList(values.platform, POST_PLATFORMS)) {
    errors.platform = "Select a valid social media platform.";
  }

  if (!values.dueDate) {
    errors.dueDate = "Enter a due date.";
  } else if (!isValidDate(values.dueDate)) {
    errors.dueDate = "Enter a valid due date.";
  }

  if (!isValueInList(values.status, POST_STATUSES)) {
    errors.status = "Select a status.";
  }

  if (!isValueInList(values.priority, POST_PRIORITIES)) {
    errors.priority = "Select a priority.";
  }

  return errors;
}

export function hasPostFormErrors(errors: PostFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
