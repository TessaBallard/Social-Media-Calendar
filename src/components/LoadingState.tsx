type LoadingStateProps = {
  message: string;
};

// Shown while apps or other saved data is being loaded.
export function LoadingState({ message }: LoadingStateProps) {
  return (
    <p className="loading-state" role="status">
      {message}
    </p>
  );
}
