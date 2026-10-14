import { useColorScheme } from "../hooks/useColorScheme";
import { useSettingsOptional } from "../hooks/useSettings";
import { COLOR_SCHEMES, type ColorScheme } from "../lib/colorScheme";
import { logger } from "../lib/logger";

// Display preference lives in the browser; when signed in it is also saved online with D-003.
export function ThemeToggle() {
  const { scheme, setScheme } = useColorScheme();
  const settings = useSettingsOptional();

  function handleChange(next: ColorScheme): void {
    logger.debug("Theme control changed", { scheme: next, persistOnline: Boolean(settings) });
    setScheme(next);
    settings?.updateSettings({ colorScheme: next });
  }

  return (
    <div className="theme-toggle">
      <label className="theme-toggle__label" htmlFor="color-scheme-select">
        Theme
      </label>
      <select
        id="color-scheme-select"
        className="field__select"
        value={scheme}
        onChange={(event) => handleChange(event.target.value as ColorScheme)}
      >
        {COLOR_SCHEMES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
