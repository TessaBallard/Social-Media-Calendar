import { useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { logger } from "../lib/logger";
import { safeReturnPath } from "../lib/returnPath";
import { hasAuthFieldErrors, validateAuthCredentials } from "../lib/validateAuth";
import type { AuthCredentials, AuthFieldErrors } from "../types/auth";

type AuthMode = "sign-in" | "create-account";

const EMPTY_CREDENTIALS: AuthCredentials = {
  email: "",
  password: "",
};

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// Sign in or create an account. The rest of the app is blocked until this succeeds.
export function SignInPage() {
  const { user, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [values, setValues] = useState(EMPTY_CREDENTIALS);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const returnPath = safeReturnPath(searchParams.get("from"));

  if (user) {
    return <Navigate to={returnPath} replace />;
  }

  const isCreate = mode === "create-account";
  const title = isCreate ? "Create account" : "Sign in";
  const submitLabel = isCreate ? "Create account" : "Sign in";

  function updateField(field: keyof AuthCredentials, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    const nextErrors = validateAuthCredentials(values);
    setErrors(nextErrors);

    if (hasAuthFieldErrors(nextErrors)) {
      logger.debug("Auth form failed validation", nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = isCreate ? await signUp(values) : await signIn(values);

      if (result.needsConfirmation) {
        setInfoMessage("Check your email to confirm your account, then sign in.");
        setMode("sign-in");
        logger.debug("Account created; email confirmation required");
      }
    } catch (error) {
      setFormError(
        toErrorMessage(
          error,
          isCreate
            ? "This account could not be created. Please try again."
            : "You could not be signed in. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header__brand">
          <p className="site-header__eyebrow">App Store planning</p>
          <p className="site-header__title">Social Media Calendar</p>
        </div>
        <div className="site-header__tools">
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className="app-main">
        <section className="page">
          <header className="page-header">
            <div>
              <h1 className="page-header__title">{title}</h1>
              <p className="page-header__description">
                {isCreate
                  ? "Create an account so your apps and posts stay private to you."
                  : "Sign in to see the apps and social media posts for your account."}
              </p>
            </div>
          </header>

          <form className="form" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <p className="form__error" role="alert">
                {formError}
              </p>
            ) : null}

            {infoMessage ? (
              <p className="form__info" role="status">
                {infoMessage}
              </p>
            ) : null}

            <div className="field">
              <label className="field__label" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                className="field__input"
                type="email"
                name="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "auth-email-error" : undefined}
              />
              {errors.email ? (
                <p className="field__error" id="auth-email-error">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                className="field__input"
                type="password"
                name="password"
                autoComplete={isCreate ? "new-password" : "current-password"}
                value={values.password}
                onChange={(event) => updateField("password", event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "auth-password-error" : undefined}
              />
              {errors.password ? (
                <p className="field__error" id="auth-password-error">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div className="form__actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait…" : submitLabel}
              </button>
            </div>
          </form>

          <p className="auth-switch">
            {isCreate ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              className="auth-switch__button"
              onClick={() => {
                setMode(isCreate ? "sign-in" : "create-account");
                setFormError(null);
                setInfoMessage(null);
                setErrors({});
                logger.debug("Auth mode changed", { mode: isCreate ? "sign-in" : "create-account" });
              }}
            >
              {isCreate ? "Sign in" : "Create account"}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
