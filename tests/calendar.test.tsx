import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { addDays, getWeekDays, todayStamp } from "../src/lib/calendarDate";
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

function postOn(dueDate: string, title = "Launch post"): PostRecord {
  return {
    id: `post-${dueDate}-${title}`,
    title,
    appId: "app-1",
    platform: "Instagram",
    dueDate,
    status: "Planned",
    priority: "Normal",
    notes: "",
    content: "",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
  };
}

describe("B-009 calendar", () => {
  it("shows a stored post on its due date in month view", async () => {
    const dueDate = todayStamp();
    await renderApp(
      "/calendar",
      appsWithForestTimer(),
      createMemoryPostsRepository([postOn(dueDate)]),
    );

    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Launch post" })).toBeInTheDocument();
    expect(screen.getByText("Tap a day to see its posts.")).toBeInTheDocument();
  });

  it("shows posts in week and day views", async () => {
    const user = userEvent.setup();
    const dueDate = todayStamp();
    const otherDay = getWeekDays(dueDate).find((stamp) => stamp !== dueDate) ?? addDays(dueDate, 1);

    await renderApp(
      "/calendar",
      appsWithForestTimer(),
      createMemoryPostsRepository([
        postOn(dueDate, "Today post"),
        postOn(otherDay, "Same week post"),
      ]),
    );

    await user.click(screen.getByRole("button", { name: "Week" }));
    const weekCalendar = screen.getByRole("region", { name: "Week calendar" });
    expect(within(weekCalendar).getByRole("link", { name: "Today post" })).toBeInTheDocument();
    expect(within(weekCalendar).getByRole("link", { name: "Same week post" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Day" }));
    expect(screen.getByRole("heading", { name: "Today post" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Same week post" })).not.toBeInTheDocument();
  });

  it("says when the selected day has no posts", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/calendar",
      appsWithForestTimer(),
      createMemoryPostsRepository([postOn(todayStamp())]),
    );

    await user.click(screen.getByRole("button", { name: "Day" }));
    expect(screen.getByRole("link", { name: "Launch post" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByRole("link", { name: "Launch post" })).not.toBeInTheDocument();
    expect(screen.getByText("No posts on this day.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByRole("link", { name: "Launch post" })).toBeInTheDocument();
  });

  it("opens post details from the calendar", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/calendar",
      appsWithForestTimer(),
      createMemoryPostsRepository([postOn(todayStamp())]),
    );

    await user.click(screen.getByRole("link", { name: "Launch post" }));

    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
  });

  it("shows an empty month when there are no posts", async () => {
    await renderApp("/calendar", appsWithForestTimer());

    expect(screen.getByRole("region", { name: "Month calendar" })).toBeInTheDocument();
    expect(screen.getByText("No posts this month.")).toBeInTheDocument();
  });

  it("shows a message when posts cannot be loaded", async () => {
    const postsRepository: PostsRepository = {
      listPosts: async () => {
        throw new Error("Posts could not be loaded. Please try again.");
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

    await renderApp("/calendar", appsWithForestTimer(), postsRepository);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Posts could not be loaded. Please try again.",
    );
    expect(screen.queryByRole("region", { name: "Month calendar" })).not.toBeInTheDocument();
  });
});
