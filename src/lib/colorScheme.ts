import { logger } from "./logger";

export const COLOR_SCHEMES = ["Light", "Dark", "System"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];
export type ResolvedColorScheme = "light" | "dark";

// Keep this key in sync with the inline script in index.html.
export const COLOR_SCHEME_STORAGE_KEY = "smc-color-scheme";

export const DEFAULT_COLOR_SCHEME: ColorScheme = "System";

export function isColorScheme(value: unknown): value is ColorScheme {
  return (COLOR_SCHEMES as readonly string[]).includes(String(value));
}

export function sanitizeColorScheme(value: unknown): ColorScheme {
  return isColorScheme(value) ? value : DEFAULT_COLOR_SCHEME;
}

export function prefersDarkColorScheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveColorScheme(scheme: ColorScheme): ResolvedColorScheme {
  if (scheme === "Dark") {
    return "dark";
  }

  if (scheme === "Light") {
    return "light";
  }

  return prefersDarkColorScheme() ? "dark" : "light";
}

export function applyColorScheme(resolved: ResolvedColorScheme): void {
  document.documentElement.dataset.theme = resolved;
  logger.debug("Applied colour scheme", { resolved });
}

export function readStoredColorScheme(): ColorScheme {
  try {
    return sanitizeColorScheme(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY));
  } catch (error) {
    logger.error("Colour scheme could not be read from the browser", error);
    return DEFAULT_COLOR_SCHEME;
  }
}

export function writeStoredColorScheme(scheme: ColorScheme): void {
  try {
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  } catch (error) {
    logger.error("Colour scheme could not be saved in the browser", error);
  }
}
