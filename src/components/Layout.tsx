import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logger } from "../lib/logger";
import { Navigation } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";

// Shared chrome for the main app screens: skip link, header, nav, and page content.
export function Layout() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    logger.debug("App layout ready", {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  async function handleSignOut(): Promise<void> {
    logger.debug("Sign out clicked", { email: user?.email });
    await signOut();
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
          <Navigation />
          <ThemeToggle />
          {user ? (
            <div className="account-bar">
              <p className="account-bar__email">{user.email}</p>
              <button className="button button--secondary" type="button" onClick={() => void handleSignOut()}>
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main id="main-content" className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
