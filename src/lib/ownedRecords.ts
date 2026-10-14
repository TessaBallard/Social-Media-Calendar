// D-001 / D-002 / D-003 belong to one signed-in account.
export function belongsToCurrentUser(
  ownerId: string | undefined,
  currentUserId: string | null,
): boolean {
  if (!currentUserId) {
    return false;
  }

  return !ownerId || ownerId === currentUserId;
}

export function requireCurrentUserId(currentUserId: string | null): string {
  if (!currentUserId) {
    throw new Error("You need to sign in to continue.");
  }

  return currentUserId;
}
