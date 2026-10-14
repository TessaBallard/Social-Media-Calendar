import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "../lib/logger";
import { ErrorPage } from "../pages/ErrorPage";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

// Catches unexpected render errors and shows the general error page.
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("Unhandled UI error", { error, info });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}
