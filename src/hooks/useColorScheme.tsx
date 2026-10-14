import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyColorScheme,
  readStoredColorScheme,
  resolveColorScheme,
  sanitizeColorScheme,
  writeStoredColorScheme,
  type ColorScheme,
  type ResolvedColorScheme,
} from "../lib/colorScheme";
import { logger } from "../lib/logger";

type ColorSchemeContextValue = {
  scheme: ColorScheme;
  resolved: ResolvedColorScheme;
  setScheme: (scheme: ColorScheme) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

type ColorSchemeProviderProps = {
  children: ReactNode;
};

// Applies Light, Dark, or System before sign-in so the sign-in page can follow the same preference.
export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  const [scheme, setSchemeState] = useState<ColorScheme>(() => {
    const initial = readStoredColorScheme();
    applyColorScheme(resolveColorScheme(initial));
    return initial;
  });

  const apply = useCallback((next: ColorScheme) => {
    applyColorScheme(resolveColorScheme(next));
  }, []);

  useEffect(() => {
    apply(scheme);
  }, [apply, scheme]);

  useEffect(() => {
    if (scheme !== "System") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      logger.debug("System colour scheme changed", { matches: media.matches });
      apply("System");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [apply, scheme]);

  const setScheme = useCallback(
    (next: ColorScheme) => {
      const sanitized = sanitizeColorScheme(next);
      logger.debug("Colour scheme selected", { scheme: sanitized });
      writeStoredColorScheme(sanitized);
      apply(sanitized);
      setSchemeState(sanitized);
    },
    [apply],
  );

  const value = useMemo<ColorSchemeContextValue>(() => {
    return {
      scheme,
      resolved: resolveColorScheme(scheme),
      setScheme,
    };
  }, [scheme, setScheme]);

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}

export function useColorScheme(): ColorSchemeContextValue {
  const context = useContext(ColorSchemeContext);

  if (!context) {
    throw new Error("useColorScheme must be used inside ColorSchemeProvider.");
  }

  return context;
}
