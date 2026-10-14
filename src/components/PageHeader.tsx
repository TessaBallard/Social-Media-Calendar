import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

// Page heading block with a short description and an optional action.
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      {action}
    </header>
  );
}
