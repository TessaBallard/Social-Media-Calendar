import { useEffect, useRef } from "react";
import { logger } from "../lib/logger";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  error?: string | null;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function focusableButtons(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled])"));
}

// Asks the user to confirm a destructive action before it happens.
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  error,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const buttons = dialogRef.current?.querySelectorAll("button");
    const cancelButton = buttons?.[buttons.length - 1];

    if (cancelButton instanceof HTMLElement) {
      cancelButton.focus();
    }

    logger.debug("Confirm dialog opened");

    return () => {
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        if (!isBusy) {
          event.preventDefault();
          logger.debug("Confirm dialog cancelled with Escape");
          onCancel();
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const buttons = focusableButtons(dialog);
      if (buttons.length === 0) {
        return;
      }

      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isBusy, onCancel]);

  return (
    <div
      ref={dialogRef}
      className="confirm-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      tabIndex={-1}
    >
      <h2 id="confirm-dialog-title" className="confirm-dialog__title">
        {title}
      </h2>
      <p id="confirm-dialog-message" className="confirm-dialog__message">
        {message}
      </p>
      {error ? (
        <p className="form__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="form__actions">
        <button className="button button--danger" type="button" onClick={onConfirm} disabled={isBusy}>
          {confirmLabel}
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
          disabled={isBusy}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
