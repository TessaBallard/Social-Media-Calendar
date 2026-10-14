import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { addDays, todayStamp } from "../src/lib/calendarDate";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import type { AppRecord } from "../src/types/appRecord";
import type { PostRecord, PostsRepository } from "../src/types/postRecord";
import { createMemoryAppsRepository } from "./memoryAppsRepository";
import { renderApp } from "./renderApp";

const forestTimer: AppRecord = {
  id: "app-1",
  name: "Forest Timer",
  storeUrl: "https://apps.apple.com/app/id123",
  notes: "",
  createdAt: "2026-09-07T00:00:00.000Z",
};

function appsWithForestTimer() {
  return createMemoryAppsRepository([forestTimer]);
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
    notes: "",
    content: "",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
    ...overrides,
  };
}

describe("B-014 dashboard summary", () => {
  it("summarises stored posts on the Dashboard", async () => {
    const today = todayStamp();
    await renderApp(
      "/",
      appsWithForestTimer(),
      createMemoryPostsRepository([
        post({ id: "soon", title: "Due soon post", dueDate: addDays(today, 2) }),
        post({ id: "later", title: "Later post", dueDate: addDays(today, 20) }),
        post({
          id: "working",
          title: "Working post",
          dueDate: "2026-09-10",
          status: "In Progress",
        }),
        post({
          id: "ready",
          title: "Ready post",
          dueDate: addDays(today, 4),
          status: "Ready",
        }),
        post({
          id: "posted",
          title: "Posted item",
          dueDate: "2026-09-01",
          status: "Posted",
          updatedAt: "2026-10-01T00:00:00.000Z",
        }),
      ]),
    );

    const counts = screen.getByRole("region", { name: "Summary of planned posts" });
    expect(counts).toHaveTextContent("Due soon");
    expect(counts).toHaveTextContent("Overdue");
    expect(counts).toHaveTextContent("In progress");
    expect(counts).toHaveTextContent("Ready to post");
    expect(counts).toHaveTextContent("Recently posted");

    expect(within(screen.getByRole("list", { name: "Upcoming posts" })).getByRole("link", { name: "Due soon post" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Overdue posts" })).getByRole("link", { name: "Working post" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Posts in progress" })).getByRole("link", { name: "Working post" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Posts ready to publish" })).getByRole("link", { name: "Ready post" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Recently posted" })).getByRole("link", { name: "Posted item" })).toBeInTheDocument();
    expect(screen.queryByText("No planned posts yet")).not.toBeInTheDocument();
  });

  it("opens a ready post from the Dashboard summary", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/",
      appsWithForestTimer(),
      createMemoryPostsRepository([
        post({
          id: "ready",
          title: "Ready post",
          dueDate: addDays(todayStamp(), 1),
          status: "Ready",
        }),
      ]),
    );

    await user.click(
      within(screen.getByRole("list", { name: "Posts ready to publish" })).getByRole("link", {
        name: "Ready post",
      }),
    );
    expect(screen.getByRole("heading", { level: 1, name: "Ready post" })).toBeInTheDocument();
  });

  it("says when the dashboard summary cannot be loaded", async () => {
    const postsRepository: PostsRepository = {
      listPosts: async () => {
        throw new Error("The dashboard summary could not be loaded.");
      },
      createPost: async () => {
        throw new Error("This post could not be saved. Please try again.");
      },
      updatePost: async () => {
        throw new Error("This post could not be saved. Please try again.");
      },
      deletePost: async () => {
        throw new Error("This post could not be deleted. Please try again.");
      },
    };

    await renderApp("/", appsWithForestTimer(), postsRepository);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The dashboard summary could not be loaded.",
    );
    expect(screen.queryByRole("region", { name: "Summary of planned posts" })).not.toBeInTheDocument();
  });
});
