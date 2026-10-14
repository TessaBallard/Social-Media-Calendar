import { describe, expect, it } from "vitest";
import { validateAuthCredentials } from "../src/lib/validateAuth";
import { safeReturnPath } from "../src/lib/returnPath";

describe("auth validation", () => {
  it("requires a valid email and a password of at least 6 characters", () => {
    expect(validateAuthCredentials({ email: "", password: "" })).toEqual({
      email: "Enter your email address.",
      password: "Enter a password.",
    });
    expect(validateAuthCredentials({ email: "not-an-email", password: "123" })).toEqual({
      email: "Enter a valid email address.",
      password: "Use at least 6 characters.",
    });
    expect(validateAuthCredentials({ email: "planner@example.com", password: "secret1" })).toEqual(
      {},
    );
  });
});

describe("return path", () => {
  it("only returns to a path inside the app", () => {
    expect(safeReturnPath("/apps")).toBe("/apps");
    expect(safeReturnPath("//evil.example")).toBe("/");
    expect(safeReturnPath("https://evil.example")).toBe("/");
    expect(safeReturnPath("/sign-in")).toBe("/");
  });
});
