import { EmptyState } from "./EmptyState";
import { useApps } from "../hooks/useApps";
import { useSettings } from "../hooks/useSettings";
import { logger } from "../lib/logger";
import {
  EMPTY_POST_QUERY,
  isPostQueryActive,
  type PostQuery,
} from "../lib/filterPosts";
import { storedFiltersFromQuery } from "../services/settingsService";
import { EMPTY_STORED_FILTERS } from "../types/userSettings";
import { POST_PLATFORMS, POST_PRIORITIES, POST_STATUSES } from "../types/postRecord";

type PostFiltersProps = {
  idPrefix: string;
  query: PostQuery;
  onQueryChange: (query: PostQuery) => void;
};

function updateField(
  query: PostQuery,
  onQueryChange: (query: PostQuery) => void,
  field: keyof PostQuery,
  value: string,
): void {
  const next = { ...query, [field]: value };
  logger.debug("Post filters changed", next);
  onQueryChange(next);
}

// F-010 + F-011: Filter and search stored posts on Calendar and Timeline.
export function PostFilters({ idPrefix, query, onQueryChange }: PostFiltersProps) {
  const { apps } = useApps();
  const { settings, status: settingsStatus, error: settingsError, saveError, updateSettings } =
    useSettings();
  const searchId = `${idPrefix}-search`;
  const rememberId = `${idPrefix}-remember`;
  const appId = `${idPrefix}-app`;
  const platformId = `${idPrefix}-platform`;
  const statusId = `${idPrefix}-status`;
  const priorityId = `${idPrefix}-priority`;
  const dateId = `${idPrefix}-date`;

  return (
    <form
      className="post-filters"
      role="search"
      aria-label="Filter and search posts"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="field post-filters__search">
        <label className="field__label" htmlFor={searchId}>
          Search posts
        </label>
        <input
          id={searchId}
          className="field__input"
          type="search"
          value={query.search}
          placeholder="Search by title or notes"
          onChange={(event) => updateField(query, onQueryChange, "search", event.target.value)}
        />
      </div>

      <fieldset className="post-filters__fieldset">
        <legend className="post-filters__legend">Filters</legend>
        <div className="post-filters__grid">
          <div className="field">
            <label className="field__label" htmlFor={appId}>
              Filter by app
            </label>
            <select
              id={appId}
              className="field__select"
              value={query.appId}
              onChange={(event) => updateField(query, onQueryChange, "appId", event.target.value)}
            >
              <option value="">All apps</option>
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor={platformId}>
              Filter by platform
            </label>
            <select
              id={platformId}
              className="field__select"
              value={query.platform}
              onChange={(event) =>
                updateField(query, onQueryChange, "platform", event.target.value)
              }
            >
              <option value="">All platforms</option>
              {POST_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor={statusId}>
              Filter by status
            </label>
            <select
              id={statusId}
              className="field__select"
              value={query.status}
              onChange={(event) => updateField(query, onQueryChange, "status", event.target.value)}
            >
              <option value="">All statuses</option>
              {POST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor={priorityId}>
              Filter by priority
            </label>
            <select
              id={priorityId}
              className="field__select"
              value={query.priority}
              onChange={(event) =>
                updateField(query, onQueryChange, "priority", event.target.value)
              }
            >
              <option value="">All priorities</option>
              {POST_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor={dateId}>
              Filter by date
            </label>
            <input
              id={dateId}
              className="field__input"
              type="date"
              value={query.dueDate}
              onChange={(event) => updateField(query, onQueryChange, "dueDate", event.target.value)}
            />
          </div>

          <div className="field field--check">
            <input
              id={rememberId}
              className="field__checkbox"
              type="checkbox"
              checked={settings.rememberFilters}
              onChange={(event) => {
                const rememberFilters = event.target.checked;
                logger.debug("Remember filters changed", { rememberFilters });
                updateSettings({
                  rememberFilters,
                  filters: rememberFilters
                    ? storedFiltersFromQuery(query)
                    : EMPTY_STORED_FILTERS,
                });
              }}
            />
            <label className="field__label" htmlFor={rememberId}>
              Remember these filters
            </label>
          </div>

          {isPostQueryActive(query) ? (
            <div className="post-filters__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  logger.debug("Post filters cleared");
                  onQueryChange(EMPTY_POST_QUERY);
                }}
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      </fieldset>

      {settingsStatus === "error" ? (
        <p className="form__error" role="status" aria-label="Settings load warning">
          {settingsError ?? "Saved preferences could not be loaded. Using defaults."}
        </p>
      ) : null}

      {saveError ? (
        <p className="form__error" role="status" aria-label="Settings save warning">
          {saveError}
        </p>
      ) : null}
    </form>
  );
}

// F-010 / F-011 empty copy when stored posts exist but none match the query.
export function PostQueryEmpty({ query }: { query: PostQuery }) {
  if (query.search.trim()) {
    return (
      <EmptyState
        title="No posts found"
        description="Try a different title or notes search."
      />
    );
  }

  return (
    <EmptyState
      title="No matching posts were found"
      description="Try a different app, platform, status, priority, or date."
    />
  );
}
