import type { PostFormValues, PostRecord } from "../types/postRecord";

type TrackedFields = Pick<PostFormValues, "platform" | "status" | "priority">;
type SavedTrackedFields = Pick<PostRecord, "platform" | "status" | "priority">;

const TRACKED_FIELDS = ["platform", "status", "priority"] as const;

function joinFieldNames(names: readonly string[]): string {
  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }

  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

// Builds a clear message when platform, status, or priority cannot be saved.
export function getPostFieldSaveError(
  attempted: TrackedFields,
  saved?: SavedTrackedFields,
): string | null {
  if (!saved) {
    return null;
  }

  const changed = TRACKED_FIELDS.filter((field) => attempted[field] !== saved[field]);

  if (changed.length === 0) {
    return null;
  }

  const names = joinFieldNames(changed);
  const kept =
    changed.length === 1
      ? `The current ${changed[0]} was kept.`
      : "The current values were kept.";

  return `The ${names} could not be saved. ${kept}`;
}
