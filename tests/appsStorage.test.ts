import { describe, expect, it } from "vitest";
import { isSupabaseConfigured } from "../src/lib/supabaseClient";
import { mapAppRow, toAppInsert } from "../src/services/appsService";

describe("app storage mapping", () => {
  it("maps a stored app row into the app used by the UI", () => {
    const app = mapAppRow({
      id: "app-1",
      name: "Forest Timer",
      store_url: "https://apps.apple.com/app/id123",
      notes: null,
      created_at: "2026-09-07T00:00:00.000Z",
    });

    expect(app).toEqual({
      id: "app-1",
      name: "Forest Timer",
      storeUrl: "https://apps.apple.com/app/id123",
      notes: "",
      createdAt: "2026-09-07T00:00:00.000Z",
    });
  });

  it("prepares trimmed values for saving", () => {
    expect(
      toAppInsert({
        name: "  Forest Timer  ",
        storeUrl: " https://apps.apple.com/app/id123 ",
        notes: " Launch week ",
      }),
    ).toEqual({
      name: "Forest Timer",
      store_url: "https://apps.apple.com/app/id123",
      notes: "Launch week",
    });
  });
});

describe("supabase config", () => {
  it("treats missing URL or key as not configured", () => {
    expect(isSupabaseConfigured("", "")).toBe(false);
    expect(isSupabaseConfigured("https://example.supabase.co", "")).toBe(false);
    expect(isSupabaseConfigured("", "test-key")).toBe(false);
    expect(isSupabaseConfigured("https://example.supabase.co", "test-key")).toBe(true);
  });
});
