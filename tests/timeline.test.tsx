import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { formatTimelineHeading } from "../src/lib/calendarDate";
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

function postOn(dueDate: string, title: string): PostRecord {
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

describe("B-011 timeline", () => {
  it("groups stored posts by due date in date order", async () => {
    await renderApp(
      "/timeline",
      appsWithForestTimer(),
      createMemoryPostsRepository([
        postOn("2026-09-12", "Later post"),
        postOn("2026-09-10", "Earlier post"),
        postOn("2026-09-10", "Same day post"),
      ]),
    );

    expect(screen.getByRole("list", { name: "Posts in date order" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: formatTimelineHeading("2026-09-10", "not-today") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: formatTimelineHeading("2026-09-12", "not-today") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Earlier post" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Same day post" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Later post" })).toBeInTheDocument();

    const headings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(headings.indexOf(formatTimelineHeading("2026-09-10", "not-today"))).toBeLessThan(
      headings.indexOf(formatTimelineHeading("2026-09-12", "not-today")),
    );
  });

  it("opens a post from the timeline", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/timeline",
      appsWithForestTimer(),
      createMemoryPostsRepository([postOn("2026-09-10", "Launch post")]),
    );

    await user.click(screen.getByRole("link", { name: "View Post" }));
    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
  });

  it("shows a message when the timeline cannot load posts", async () => {
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

    await renderApp("/timeline", appsWithForestTimer(), postsRepository);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Posts could not be loaded. Please try again.",
    );
  });
});
