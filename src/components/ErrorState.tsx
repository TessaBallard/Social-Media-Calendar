type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

// Shown when saved data cannot be loaded.
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state__message">{message}</p>
      {onRetry ? (
        <button className="button button--secondary" type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
