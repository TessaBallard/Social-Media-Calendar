import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import { COLOR_SCHEME_STORAGE_KEY } from "../src/lib/colorScheme";

function createMatchMedia(matches: boolean): (query: string) => MediaQueryList {
  return (query: string): MediaQueryList => ({
    matches,
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
}

beforeEach(() => {
  window.matchMedia = createMatchMedia(false);
  window.localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
  document.documentElement.removeAttribute("data-theme");
});
