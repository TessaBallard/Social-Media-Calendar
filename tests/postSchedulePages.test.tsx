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

describe("B-013 overdue and upcoming posts", () => {
  it("shows overdue and upcoming posts on the Dashboard", async () => {
    const today = todayStamp();
    await renderApp(
      "/",
      appsWithForestTimer(),
      createMemoryPostsRepository([
        post({ id: "overdue", title: "Late launch", dueDate: "2026-09-10", status: "In Progress" }),
        post({ id: "upcoming", title: "Upcoming launch", dueDate: addDays(today, 2) }),
        post({ id: "posted", title: "Already posted", dueDate: "2026-09-01", status: "Posted" }),
      ]),
    );

    const overdue = screen.getByRole("list", { name: "Overdue posts" });
    expect(within(overdue).getByRole("link", { name: "Late launch" })).toBeInTheDocument();
    expect(within(overdue).getByText(/Due 2026-09-10 · Overdue/)).toBeInTheDocument();
    expect(within(overdue).queryByRole("link", { name: "Already posted" })).not.toBeInTheDocument();

    const upcoming = screen.getByRole("list", { name: "Upcoming posts" });
    expect(within(upcoming).getByRole("link", { name: "Upcoming launch" })).toBeInTheDocument();
    expect(within(upcoming).queryByRole("link", { name: "Late launch" })).not.toBeInTheDocument();
    expect(screen.queryByText("No planned posts yet")).not.toBeInTheDocument();
  });

  it("shows overdue and upcoming posts on the Timeline", async () => {
    const today = todayStamp();
    await renderApp(
      "/timeline",
      appsWithForestTimer(),
      createMemoryPostsRepository([
        post({ id: "overdue", title: "Overdue launch", dueDate: "2026-09-10" }),
        post({ id: "upcoming", title: "Upcoming launch", dueDate: addDays(today, 1) }),
      ]),
    );

    expect(screen.getByRole("list", { name: "Overdue posts" })).toHaveTextContent("Overdue launch");
    expect(screen.getByRole("list", { name: "Upcoming posts" })).toHaveTextContent("Upcoming launch");
    expect(screen.getByRole("heading", { name: "Overdue launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upcoming launch" })).toBeInTheDocument();
  });

  it("shows overdue posts on the Calendar and marks them on the board", async () => {
    const user = userEvent.setup();
    const today = todayStamp();
    const overdueDate = addDays(today, -1);
    await renderApp(
      "/calendar",
      appsWithForestTimer(),
      createMemoryPostsRepository([
        post({ id: "overdue", title: "Overdue launch", dueDate: overdueDate }),
        post({ id: "posted", title: "Already posted", dueDate: overdueDate, status: "Posted" }),
        post({ id: "upcoming", title: "Upcoming launch", dueDate: addDays(today, 3) }),
      ]),
    );

    const overdue = screen.getByRole("list", { name: "Overdue posts" });
    expect(within(overdue).getByRole("link", { name: "Overdue launch" })).toBeInTheDocument();
    expect(within(overdue).queryByRole("link", { name: "Already posted" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Upcoming posts" })).not.toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Day" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Overdue launch" })).toBeInTheDocument();
  });

  it("says when overdue information is unavailable", async () => {
    await renderApp(
      "/",
      appsWithForestTimer(),
      createMemoryPostsRepository([post({ dueDate: "not-a-date" })]),
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Overdue information is unavailable.");
  });

  it("says when upcoming posts cannot be loaded", async () => {
    const postsRepository: PostsRepository = {
      listPosts: async () => {
        throw new Error("Upcoming posts could not be loaded.");
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

    expect(await screen.findByRole("alert")).toHaveTextContent("Upcoming posts could not be loaded.");
  });

  it("opens an overdue post from the Dashboard", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/",
      appsWithForestTimer(),
      createMemoryPostsRepository([post({ title: "Overdue launch", dueDate: "2026-09-10" })]),
    );

    await user.click(screen.getByRole("link", { name: "Overdue launch" }));
    expect(screen.getByRole("heading", { level: 1, name: "Overdue launch" })).toBeInTheDocument();
  });
});
