import { describe, expect, it } from "vitest";
import { getPostFieldSaveError } from "../src/lib/postSaveError";

describe("getPostFieldSaveError", () => {
  const saved = {
    platform: "Instagram" as const,
    status: "Planned" as const,
    priority: "Normal" as const,
  };

  it("explains when only the platform could not be saved", () => {
    expect(
      getPostFieldSaveError(
        { platform: "TikTok", status: "Planned", priority: "Normal" },
        saved,
      ),
    ).toBe("The platform could not be saved. The current platform was kept.");
  });

  it("explains when only the status could not be saved", () => {
    expect(
      getPostFieldSaveError(
        { platform: "Instagram", status: "Posted", priority: "Normal" },
        saved,
      ),
    ).toBe("The status could not be saved. The current status was kept.");
  });

  it("explains when only the priority could not be saved", () => {
    expect(
      getPostFieldSaveError(
        { platform: "Instagram", status: "Planned", priority: "Urgent" },
        saved,
      ),
    ).toBe("The priority could not be saved. The current priority was kept.");
  });

  it("explains when status and priority could not be saved", () => {
    expect(
      getPostFieldSaveError(
        { platform: "Instagram", status: "Posted", priority: "Urgent" },
        saved,
      ),
    ).toBe("The status and priority could not be saved. The current values were kept.");
  });

  it("explains when platform, status, and priority could not be saved", () => {
    expect(
      getPostFieldSaveError(
        { platform: "TikTok", status: "Posted", priority: "Urgent" },
        saved,
      ),
    ).toBe(
      "The platform, status, and priority could not be saved. The current values were kept.",
    );
  });

  it("returns null when tracked fields did not change", () => {
    expect(
      getPostFieldSaveError(
        { platform: "Instagram", status: "Planned", priority: "Normal" },
        saved,
      ),
    ).toBeNull();
  });
});
