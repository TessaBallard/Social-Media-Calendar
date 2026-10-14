import { useEffect, useRef, useState } from "react";
import { EMPTY_POST_QUERY, type PostQuery } from "../lib/filterPosts";
import { logger } from "../lib/logger";
import { postQueryFromSettings, storedFiltersFromQuery } from "../services/settingsService";
import { useSettings } from "./useSettings";

// Applies D-003 selected filters on Calendar and Timeline, then saves changes.
export function usePersistedPostQuery() {
  const { settings, status, updateSettings } = useSettings();
  const [query, setQuery] = useState<PostQuery>(EMPTY_POST_QUERY);
  const hydrated = useRef(false);

  useEffect(() => {
    if (status !== "ready" || hydrated.current) {
      return;
    }

    hydrated.current = true;
    const restored = postQueryFromSettings(settings);
    logger.debug("Restored selected filters", restored);
    setQuery((current) => ({
      ...restored,
      search: current.search,
      dueDate: current.dueDate,
    }));
  }, [settings, status]);

  function applyQuery(nextQuery: PostQuery): void {
    setQuery(nextQuery);

    if (!settings.rememberFilters) {
      return;
    }

    updateSettings({ filters: storedFiltersFromQuery(nextQuery) });
  }

  return {
    query,
    applyQuery,
  };
}
