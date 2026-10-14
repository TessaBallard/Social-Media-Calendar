import type { User } from "@supabase/supabase-js";
import { requireSupabaseClient } from "../lib/supabaseClient";
import type { AuthUser } from "../types/auth";

export async function requireSignedInUserId(): Promise<string> {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    throw new Error("You need to sign in to continue.");
  }

  return data.user.id;
}

export function mapAuthUser(user: User | null): AuthUser | null {
  if (!user?.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export function toAuthErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : fallback;
  const normalised = message.toLowerCase();

  if (normalised.includes("invalid login credentials")) {
    return "That email or password is not correct.";
  }

  if (normalised.includes("user already registered") || normalised.includes("already been registered")) {
    return "An account with that email already exists. Sign in instead.";
  }

  if (normalised.includes("email not confirmed")) {
    return "Confirm your email address, then sign in.";
  }

  if (normalised.includes("signups not allowed")) {
    return "New accounts cannot be created right now.";
  }

  return message || fallback;
}
