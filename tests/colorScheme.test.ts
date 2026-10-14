import { describe, expect, it } from "vitest";
import {
  COLOR_SCHEME_STORAGE_KEY,
  applyColorScheme,
  readStoredColorScheme,
  resolveColorScheme,
  sanitizeColorScheme,
  writeStoredColorScheme,
} from "../src/lib/colorScheme";
import { createDefaultSettings } from "../src/services/settingsService";

describe("colour scheme", () => {
  it("keeps Light, Dark, or System and falls back to System", () => {
    expect(sanitizeColorScheme("Dark")).toBe("Dark");
    expect(sanitizeColorScheme("Light")).toBe("Light");
    expect(sanitizeColorScheme("System")).toBe("System");
    expect(sanitizeColorScheme("sepia")).toBe("System");
  });

  it("resolves System from the browser preference", () => {
    expect(resolveColorScheme("Light")).toBe("light");
    expect(resolveColorScheme("Dark")).toBe("dark");
    expect(resolveColorScheme("System")).toBe("light");

    window.matchMedia = (query: string): MediaQueryList => ({
      matches: true,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    });

    expect(resolveColorScheme("System")).toBe("dark");
  });

  it("remembers the choice in the browser and on the page", () => {
    writeStoredColorScheme("Dark");
    expect(readStoredColorScheme()).toBe("Dark");
    expect(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe("Dark");

    applyColorScheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("uses the browser colour scheme when no settings row exists yet", () => {
    writeStoredColorScheme("Dark");
    expect(createDefaultSettings().colorScheme).toBe("Dark");
  });
});
