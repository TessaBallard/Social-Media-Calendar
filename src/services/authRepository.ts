import { logger } from "../lib/logger";
import { requireSupabaseClient } from "../lib/supabaseClient";
import { mapAuthUser, toAuthErrorMessage } from "./authService";
import type { AuthCredentials, AuthRepository, AuthResult, AuthUser } from "../types/auth";

function signInFailedError(error: unknown): Error {
  return new Error(toAuthErrorMessage(error, "You could not be signed in. Please try again."));
}

function signUpFailedError(error: unknown): Error {
  return new Error(toAuthErrorMessage(error, "This account could not be created. Please try again."));
}

function signOutFailedError(): Error {
  return new Error("You could not be signed out. Please try again.");
}

async function claimOrphanData(): Promise<void> {
  const client = requireSupabaseClient();
  const { error } = await client.rpc("claim_orphan_planner_data");

  if (error) {
    logger.debug("Orphan planner data was not claimed", error);
  }
}

// Reads and writes the signed-in account through Supabase Auth.
export const supabaseAuthRepository: AuthRepository = {
  getCachedSession(): AuthUser | null {
    return null;
  },

  async getSession(): Promise<AuthUser | null> {
    const client = requireSupabaseClient();
    logger.debug("Loading signed-in session");
    const { data, error } = await client.auth.getSession();

    if (error) {
      logger.error("Failed to load signed-in session", error);
      return null;
    }

    return mapAuthUser(data.session?.user ?? null);
  },

  onAuthStateChange(listener: (user: AuthUser | null) => void): () => void {
    const client = requireSupabaseClient();
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      listener(mapAuthUser(session?.user ?? null));
    });

    return () => {
      data.subscription.unsubscribe();
    };
  },

  async signIn(credentials: AuthCredentials): Promise<AuthResult> {
    const client = requireSupabaseClient();
    logger.debug("Signing in", { email: credentials.email.trim() });

    const { data, error } = await client.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      logger.error("Sign in failed", error);
      throw signInFailedError(error);
    }

    const user = mapAuthUser(data.user);
    if (user) {
      await claimOrphanData();
    }

    return { user, needsConfirmation: false };
  },

  async signUp(credentials: AuthCredentials): Promise<AuthResult> {
    const client = requireSupabaseClient();
    logger.debug("Creating account", { email: credentials.email.trim() });

    const { data, error } = await client.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      logger.error("Create account failed", error);
      throw signUpFailedError(error);
    }

    const user = mapAuthUser(data.user);
    const needsConfirmation = Boolean(data.user) && !data.session;

    if (user && data.session) {
      await claimOrphanData();
    }

    return { user: data.session ? user : null, needsConfirmation };
  },

  async signOut(): Promise<void> {
    const client = requireSupabaseClient();
    logger.debug("Signing out");
    const { error } = await client.auth.signOut();

    if (error) {
      logger.error("Sign out failed", error);
      throw signOutFailedError();
    }
  },
};
