import type { AuthCredentials, AuthFieldErrors } from "../types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks the sign-in and create-account form before talking to storage.
export function validateAuthCredentials(values: AuthCredentials): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = values.email.trim();
  const password = values.password;

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Enter a password.";
  } else if (password.length < 6) {
    errors.password = "Use at least 6 characters.";
  }

  return errors;
}

export function hasAuthFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
