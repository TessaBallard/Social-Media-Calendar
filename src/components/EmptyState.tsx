type EmptyStateProps = {
  title: string;
  description: string;
};

// Shared empty-state message used when a page has no data yet.
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>
    </div>
  );
}
