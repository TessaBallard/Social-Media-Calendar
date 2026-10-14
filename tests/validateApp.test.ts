import { describe, expect, it } from "vitest";
import { hasAppFormErrors, validateAppForm } from "../src/lib/validateApp";

describe("validateAppForm", () => {
  it("requires an app name and App Store link", () => {
    const errors = validateAppForm({ name: "  ", storeUrl: "", notes: "" });

    expect(errors.name).toBe("Enter an app name.");
    expect(errors.storeUrl).toBe("Enter an App Store link.");
    expect(hasAppFormErrors(errors)).toBe(true);
  });

  it("rejects a link that is not a valid http URL", () => {
    const errors = validateAppForm({
      name: "Forest Timer",
      storeUrl: "not-a-link",
      notes: "",
    });

    expect(errors.storeUrl).toBe(
      "Enter a valid App Store link, including https://.",
    );
  });

  it("allows notes to be empty", () => {
    const errors = validateAppForm({
      name: "Forest Timer",
      storeUrl: "https://apps.apple.com/app/id123",
      notes: "",
    });

    expect(errors).toEqual({});
    expect(hasAppFormErrors(errors)).toBe(false);
  });
});
