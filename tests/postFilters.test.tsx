import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { todayStamp } from "../src/lib/calendarDate";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import type { AppRecord } from "../src/types/appRecord";
import type { PostRecord } from "../src/types/postRecord";
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

function post(overrides: Partial<PostRecord>): PostRecord {
  return {
    id: "post-1",
    title: "Launch post",
    appId: "app-1",
    platform: "Instagram",
    dueDate: "2026-09-10",
    status: "Planned",
    priority: "Normal",
    notes: "Film in the morning",
    content: "Secret caption draft",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
    ...overrides,
  };
}

function storedPosts(): PostRecord[] {
  return [
    post({ id: "launch", title: "Launch post" }),
    post({
      id: "trends",
      title: "Spending Trends",
      appId: "app-2",
      platform: "TikTok",
      dueDate: "2026-09-12",
      status: "Ready",
      priority: "High",
      notes: "Use the beach clip",
    }),
  ];
}

describe("B-012 filter and search posts", () => {
  it("filters timeline posts by app, platform, status, priority, and date", async () => {
    const user = userEvent.setup();
    await renderApp("/timeline", appsWithTwoApps(), createMemoryPostsRepository(storedPosts()));

    expect(screen.getByRole("heading", { name: "Launch post" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Spending Trends" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by app"), "Tide Guide");
    expect(screen.queryByRole("heading", { name: "Launch post" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Spending Trends" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.selectOptions(screen.getByLabelText("Filter by platform"), "Instagram");
    expect(screen.getByRole("heading", { name: "Launch post" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Spending Trends" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.selectOptions(screen.getByLabelText("Filter by status"), "Ready");
    expect(screen.getByRole("heading", { name: "Spending Trends" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.selectOptions(screen.getByLabelText("Filter by priority"), "High");
    expect(screen.getByRole("heading", { name: "Spending Trends" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.type(screen.getByLabelText("Filter by date"), "2026-09-10");
    expect(screen.getByRole("heading", { name: "Launch post" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Spending Trends" })).not.toBeInTheDocument();
  });

  it("searches timeline posts by title or notes", async () => {
    const user = userEvent.setup();
    await renderApp("/timeline", appsWithTwoApps(), createMemoryPostsRepository(storedPosts()));

    await user.type(screen.getByLabelText("Search posts"), "beach");
    expect(screen.queryByRole("heading", { name: "Launch post" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Spending Trends" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Search posts"));
    await user.type(screen.getByLabelText("Search posts"), "Secret caption");
    expect(screen.getByRole("heading", { name: "No posts found" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Launch post" })).not.toBeInTheDocument();
  });

  it("says when no posts match the filters", async () => {
    const user = userEvent.setup();
    await renderApp("/timeline", appsWithTwoApps(), createMemoryPostsRepository(storedPosts()));

    await user.selectOptions(screen.getByLabelText("Filter by status"), "Cancelled");

    expect(screen.getByRole("heading", { name: "No matching posts were found" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Posts in date order" })).not.toBeInTheDocument();
  });

  it("filters and searches calendar posts", async () => {
    const user = userEvent.setup();
    const today = todayStamp();
    await renderApp(
      "/calendar",
      appsWithTwoApps(),
      createMemoryPostsRepository([
        post({ id: "today-ig", title: "Launch post", dueDate: today }),
        post({
          id: "today-tt",
          title: "Spending Trends",
          appId: "app-2",
          platform: "TikTok",
          dueDate: today,
          status: "Ready",
          notes: "Use the beach clip",
        }),
      ]),
    );

    expect(screen.getByRole("search", { name: "Filter and search posts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Launch post" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spending Trends" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by platform"), "TikTok");
    expect(screen.queryByRole("link", { name: "Launch post" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spending Trends" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.type(screen.getByLabelText("Search posts"), "Launch");
    expect(screen.getByRole("link", { name: "Launch post" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Spending Trends" })).not.toBeInTheDocument();
  });

  it("says when the calendar has no matching posts", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/calendar",
      appsWithTwoApps(),
      createMemoryPostsRepository([post({ title: "Launch post", dueDate: todayStamp() })]),
    );

    await user.selectOptions(screen.getByLabelText("Filter by platform"), "YouTube");
    expect(screen.getByRole("heading", { name: "No matching posts were found" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Launch post" })).not.toBeInTheDocument();
  });
});
