import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { logger } from "../lib/logger";
import { NAV_ITEMS } from "../lib/routes";

// Main navigation between Dashboard, Calendar, Timeline, and Apps.
// The list wraps into a two-column tap grid on phones (B-018).
export function Navigation() {
  const location = useLocation();

  useEffect(() => {
    logger.debug("Navigation changed", { path: location.pathname });
  }, [location.pathname]);

  return (
    <nav className="site-nav" aria-label="Main">
      <ul className="site-nav__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "site-nav__link is-active" : "site-nav__link"
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
