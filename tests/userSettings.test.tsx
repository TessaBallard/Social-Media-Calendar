import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { todayStamp } from "../src/lib/calendarDate";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import { createMemorySettingsRepository } from "../src/services/memorySettingsRepository";
import { createDefaultSettings } from "../src/services/settingsService";
import type { AppRecord } from "../src/types/appRecord";
import type { PostRecord } from "../src/types/postRecord";
import type { SettingsRepository, UserSettings } from "../src/types/userSettings";
import { createMemoryAppsRepository } from "./memoryAppsRepository";
import { renderApp } from "./renderApp";

const forestTimer: AppRecord = {
  id: "app-1",
  name: "Forest Timer",
  storeUrl: "https://apps.apple.com/app/id123",
  notes: "",
  createdAt: "2026-09-07T00:00:00.000Z",
};

const tideGuide: AppRecord = {
  id: "app-2",
  name: "Tide Guide",
  storeUrl: "https://apps.apple.com/app/id456",
  notes: "",
  createdAt: "2026-09-07T00:00:00.000Z",
};

function appsWithTwoApps() {
  return createMemoryAppsRepository([forestTimer, tideGuide]);
}

function post(overrides: Partial<PostRecord> = {}): PostRecord {
  return {
    id: "post-1",
    title: "Launch post",
    appId: "app-1",
    platform: "Instagram",
    dueDate: todayStamp(),
    status: "Planned",
    priority: "Normal",
    notes: "",
    content: "",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
    ...overrides,
  };
}

function storedSettings(overrides: Partial<UserSettings> = {}) {
  return createMemorySettingsRepository({
    ...createDefaultSettings(),
    ...overrides,
    filters: {
      ...createDefaultSettings().filters,
      ...overrides.filters,
    },
  });
}

async function flushSettingsSave(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("B-016 user settings", () => {
  it("restores the saved calendar view", async () => {
    await renderApp(
      "/calendar",
      appsWithTwoApps(),
      createMemoryPostsRepository([post()]),
      storedSettings({ calendarView: "Week" }),
    );

    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
  });

  it("saves the calendar view and restores it after leaving the page", async () => {
    const user = userEvent.setup();
    const settingsRepository = storedSettings();
    const apps = appsWithTwoApps();
    const posts = createMemoryPostsRepository([post()]);

    const firstVisit = await renderApp("/calendar", apps, posts, settingsRepository);
    await user.click(screen.getByRole("button", { name: "Day" }));
    await flushSettingsSave();
    expect(await settingsRepository.getSettings()).toMatchObject({ calendarView: "Day" });
    firstVisit.unmount();

    await renderApp("/calendar", apps, posts, settingsRepository);
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
  });

  it("restores selected filters on Calendar and Timeline", async () => {
    const settingsRepository = storedSettings({
      filters: {
        appId: "app-2",
        platform: "TikTok",
        status: "Ready",
        priority: "High",
      },
    });
    const posts = createMemoryPostsRepository([
      post(),
      post({
        id: "trends",
        title: "Spending Trends",
        appId: "app-2",
        platform: "TikTok",
        status: "Ready",
        priority: "High",
      }),
    ]);

    await renderApp("/calendar", appsWithTwoApps(), posts, settingsRepository);

    expect(screen.getByLabelText("Filter by app")).toHaveValue("app-2");
    expect(screen.getByLabelText("Filter by platform")).toHaveValue("TikTok");
    expect(screen.getByLabelText("Filter by status")).toHaveValue("Ready");
    expect(screen.getByLabelText("Filter by priority")).toHaveValue("High");
    expect(screen.queryByRole("link", { name: "Launch post" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spending Trends" })).toBeInTheDocument();
  });

  it("remembers a filter change when opening Timeline", async () => {
    const user = userEvent.setup();
    const settingsRepository = storedSettings();
    const apps = appsWithTwoApps();
    const posts = createMemoryPostsRepository([
      post(),
      post({
        id: "trends",
        title: "Spending Trends",
        appId: "app-2",
        platform: "TikTok",
        dueDate: todayStamp(),
        status: "Ready",
        priority: "High",
      }),
    ]);

    const calendar = await renderApp("/calendar", apps, posts, settingsRepository);
    await user.selectOptions(screen.getByLabelText("Filter by app"), "Tide Guide");
    await flushSettingsSave();
    calendar.unmount();

    await renderApp("/timeline", apps, posts, settingsRepository);
    expect(screen.getByLabelText("Filter by app")).toHaveValue("app-2");
    expect(screen.queryByRole("heading", { name: "Launch post" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Spending Trends" })).toBeInTheDocument();
  });

  it("does not keep filters when Remember these filters is turned off", async () => {
    const user = userEvent.setup();
    const settingsRepository = storedSettings();
    const apps = appsWithTwoApps();
    const posts = createMemoryPostsRepository([post(), post({ id: "other", title: "Other post" })]);

    const calendar = await renderApp("/calendar", apps, posts, settingsRepository);
    await user.selectOptions(screen.getByLabelText("Filter by platform"), "Instagram");
    await user.click(screen.getByLabelText("Remember these filters"));
    await flushSettingsSave();
    expect(await settingsRepository.getSettings()).toMatchObject({
      rememberFilters: false,
      filters: {
        appId: "",
        platform: "",
        status: "",
        priority: "",
      },
    });
    calendar.unmount();

    await renderApp("/timeline", apps, posts, settingsRepository);
    expect(screen.getByLabelText("Filter by platform")).toHaveValue("");
    expect(screen.getByLabelText("Remember these filters")).not.toBeChecked();
  });

  it("keeps the calendar usable when settings cannot be loaded", async () => {
    const settingsRepository: SettingsRepository = {
      getSettings: async () => {
        throw new Error("Saved preferences could not be loaded. Please try again.");
      },
      saveSettings: async () => {
        throw new Error("Saved preferences could not be saved. Please try again.");
      },
    };

    await renderApp(
      "/calendar",
      appsWithTwoApps(),
      createMemoryPostsRepository([post()]),
      settingsRepository,
    );

    expect(screen.getByRole("status", { name: "Settings load warning" })).toHaveTextContent(
      "Saved preferences could not be loaded. Please try again.",
    );
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Launch post" })).toBeInTheDocument();
  });

  it("shows a message when preferences cannot be saved", async () => {
    const user = userEvent.setup();
    const settingsRepository: SettingsRepository = {
      getSettings: async () => createDefaultSettings(),
      saveSettings: async () => {
        throw new Error("Saved preferences could not be saved. Please try again.");
      },
    };

    await renderApp(
      "/calendar",
      appsWithTwoApps(),
      createMemoryPostsRepository([post()]),
      settingsRepository,
    );

    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(
      await screen.findByRole("status", { name: "Settings save warning" }),
    ).toHaveTextContent("Saved preferences could not be saved. Please try again.");
  });
});
