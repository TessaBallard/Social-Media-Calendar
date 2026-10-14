import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { COLOR_SCHEME_STORAGE_KEY } from "../src/lib/colorScheme";
import { createMemoryAuthRepository } from "../src/services/memoryAuthRepository";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import { createMemorySettingsRepository } from "../src/services/memorySettingsRepository";
import { createDefaultSettings } from "../src/services/settingsService";
import { TEST_USER, TEST_USER_PASSWORD } from "../src/types/auth";
import { createMemoryAppsRepository } from "./memoryAppsRepository";
import { renderApp } from "./renderApp";

async function flushSettingsSave(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("B-019 dark mode and accessibility", () => {
  it("lets a visitor choose dark mode before signing in", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/sign-in",
      undefined,
      undefined,
      undefined,
      createMemoryAuthRepository({ user: null }),
    );

    await user.selectOptions(screen.getByLabelText("Theme"), "Dark");

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe("Dark");
  });

  it("keeps a sign-in page dark choice after the first sign in", async () => {
    const user = userEvent.setup();
    const authRepository = createMemoryAuthRepository({ user: null });
    const peekUserId = () => authRepository.getCachedSession()?.id ?? null;
    const settingsRepository = createMemorySettingsRepository(undefined, peekUserId);

    await renderApp(
      "/sign-in",
      createMemoryAppsRepository([], peekUserId),
      createMemoryPostsRepository([], peekUserId),
      settingsRepository,
      authRepository,
    );

    await user.selectOptions(screen.getByLabelText("Theme"), "Dark");
    await user.type(screen.getByLabelText("Email"), TEST_USER.email);
    await user.type(screen.getByLabelText("Password"), TEST_USER_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByLabelText("Theme")).toHaveValue("Dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("saves the colour scheme online and restores it later", async () => {
    const user = userEvent.setup();
    const settingsRepository = createMemorySettingsRepository({
      ...createDefaultSettings(),
      colorScheme: "Light",
    });
    const firstVisit = await renderApp("/", undefined, undefined, settingsRepository);

    await user.selectOptions(screen.getByLabelText("Theme"), "Dark");
    await flushSettingsSave();
    expect(await settingsRepository.getSettings()).toMatchObject({ colorScheme: "Dark" });
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    firstVisit.unmount();

    await renderApp("/", undefined, undefined, settingsRepository);
    expect(await screen.findByLabelText("Theme")).toHaveValue("Dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
