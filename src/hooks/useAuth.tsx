import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logger } from "../lib/logger";
import { supabaseAuthRepository } from "../services/authRepository";
import { toAuthErrorMessage } from "../services/authService";
import type { AuthCredentials, AuthRepository, AuthResult, AuthUser } from "../types/auth";

type LoadStatus = "loading" | "ready";

type AuthContextValue = {
  user: AuthUser | null;
  status: LoadStatus;
  signIn: (credentials: AuthCredentials) => Promise<AuthResult>;
  signUp: (credentials: AuthCredentials) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  repository?: AuthRepository;
};

function toErrorMessage(error: unknown, fallback: string): Error {
  return new Error(toAuthErrorMessage(error, fallback));
}

// Keeps the signed-in account available to the rest of the app.
export function AuthProvider({
  children,
  repository = supabaseAuthRepository,
}: AuthProviderProps) {
  const cached = repository.getCachedSession();
  const [user, setUser] = useState<AuthUser | null>(cached);
  const [status, setStatus] = useState<LoadStatus>(cached ? "ready" : "loading");

  useEffect(() => {
    let cancelled = false;

    void repository.getSession().then((sessionUser) => {
      if (cancelled) {
        return;
      }

      logger.debug("Loaded auth session", { signedIn: Boolean(sessionUser) });
      setUser(sessionUser);
      setStatus("ready");
    });

    const unsubscribe = repository.onAuthStateChange((nextUser) => {
      logger.debug("Auth state changed", { signedIn: Boolean(nextUser) });
      setUser(nextUser);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [repository]);

  const signIn = useCallback(
    async (credentials: AuthCredentials): Promise<AuthResult> => {
      try {
        const result = await repository.signIn(credentials);
        setUser(result.user);
        logger.debug("Signed in", { email: result.user?.email });
        return result;
      } catch (error) {
        logger.error("Sign in failed", error);
        throw toErrorMessage(error, "You could not be signed in. Please try again.");
      }
    },
    [repository],
  );

  const signUp = useCallback(
    async (credentials: AuthCredentials): Promise<AuthResult> => {
      try {
        const result = await repository.signUp(credentials);
        setUser(result.user);
        logger.debug("Created account", {
          email: result.user?.email,
          needsConfirmation: result.needsConfirmation,
        });
        return result;
      } catch (error) {
        logger.error("Create account failed", error);
        throw toErrorMessage(error, "This account could not be created. Please try again.");
      }
    },
    [repository],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await repository.signOut();
    setUser(null);
    logger.debug("Signed out");
  }, [repository]);

  const value = useMemo<AuthContextValue>(() => {
    return { user, status, signIn, signUp, signOut };
  }, [user, status, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
