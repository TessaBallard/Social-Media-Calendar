import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createMemoryAuthRepository } from "../src/services/memoryAuthRepository";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import type { AppRecord } from "../src/types/appRecord";
import { TEST_USER, TEST_USER_PASSWORD } from "../src/types/auth";
import { createMemoryAppsRepository } from "./memoryAppsRepository";
import { renderApp } from "./renderApp";

const USER_A = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  email: "alpha@example.com",
  password: "password123",
};

const USER_B = {
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  email: "beta@example.com",
  password: "password123",
};

const forestTimer: AppRecord = {
  id: "app-a",
  name: "Forest Timer",
  storeUrl: "https://apps.apple.com/app/id123",
  notes: "",
  createdAt: "2026-09-07T00:00:00.000Z",
  userId: USER_A.id,
};

const tideGuide: AppRecord = {
  id: "app-b",
  name: "Tide Guide",
  storeUrl: "https://apps.apple.com/app/id456",
  notes: "",
  createdAt: "2026-09-07T00:00:00.000Z",
  userId: USER_B.id,
};

describe("B-017 sign in", () => {
  it("sends signed-out visitors to sign in instead of the dashboard", async () => {
    await renderApp(
      "/",
      undefined,
      undefined,
      undefined,
      createMemoryAuthRepository({ user: null }),
    );

    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "Dashboard" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("signs in and shows that account's planner", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/sign-in",
      undefined,
      undefined,
      undefined,
      createMemoryAuthRepository({ user: null }),
    );

    await user.type(screen.getByLabelText("Email"), TEST_USER.email);
    await user.type(screen.getByLabelText("Password"), TEST_USER_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText(TEST_USER.email)).toBeInTheDocument();
  });

  it("shows a message when the email or password is wrong", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/sign-in",
      undefined,
      undefined,
      undefined,
      createMemoryAuthRepository({ user: null }),
    );

    await user.type(screen.getByLabelText("Email"), TEST_USER.email);
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That email or password is not correct.",
    );
  });

  it("creates an account and opens the planner", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/sign-in",
      undefined,
      undefined,
      undefined,
      createMemoryAuthRepository({ user: null, accounts: [] }),
    );

    await user.click(screen.getByRole("button", { name: "Create account" }));
    await user.type(screen.getByLabelText("Email"), "new.planner@example.com");
    await user.type(screen.getByLabelText("Password"), "secret99");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("new.planner@example.com")).toBeInTheDocument();
  });

  it("signs out and hides the planner", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "Dashboard" })).not.toBeInTheDocument();
  });

  it("keeps each user's apps on their own account", async () => {
    const user = userEvent.setup();
    const authRepository = createMemoryAuthRepository({
      user: null,
      accounts: [USER_A, USER_B],
    });
    const peekUserId = () => authRepository.peekUserId();
    const appsRepository = createMemoryAppsRepository([forestTimer, tideGuide], peekUserId);

    await renderApp("/apps", appsRepository, createMemoryPostsRepository([], peekUserId), undefined, authRepository);

    await user.type(screen.getByLabelText("Email"), USER_A.email);
    await user.type(screen.getByLabelText("Password"), USER_A.password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Forest Timer" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tide Guide" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await user.type(await screen.findByLabelText("Email"), USER_B.email);
    await user.type(screen.getByLabelText("Password"), USER_B.password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Tide Guide" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Forest Timer" })).not.toBeInTheDocument();
  });

  it("sends /unauthorized to sign in", async () => {
    await renderApp(
      "/unauthorized",
      undefined,
      undefined,
      undefined,
      createMemoryAuthRepository({ user: null }),
    );

    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
  });
});
