import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import type { AppRecord } from "../src/types/appRecord";
import type { PostsRepository } from "../src/types/postRecord";
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

describe("B-010 quick add", () => {
  it("opens a quick add form on the Dashboard without leaving the page", async () => {
    const user = userEvent.setup();
    await renderApp("/", appsWithForestTimer());

    await user.click(screen.getByRole("button", { name: "+ Add Post" }));

    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quick add" })).toBeInTheDocument();
    expect(screen.getByLabelText("Post title")).toBeInTheDocument();
    expect(screen.getByLabelText("App")).toBeInTheDocument();
    expect(screen.getByLabelText("Platform")).toBeInTheDocument();
    expect(screen.getByLabelText("Due date")).toBeInTheDocument();
    expect(screen.queryByLabelText("Notes (optional)")).not.toBeInTheDocument();
  });

  it("adds a post from the Dashboard", async () => {
    const user = userEvent.setup();
    await renderApp("/", appsWithForestTimer());

    await user.click(screen.getByRole("button", { name: "+ Add Post" }));
    await user.type(screen.getByLabelText("Post title"), "Launch post");
    await user.selectOptions(screen.getByLabelText("Platform"), "Instagram");
    await user.click(screen.getByRole("button", { name: "Add Post" }));

    expect(
      await screen.findByRole("status", { name: /Launch post was added/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "View Post" }));
    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
  });

  it("adds a post from the Calendar without leaving the page", async () => {
    const user = userEvent.setup();
    await renderApp("/calendar", appsWithForestTimer());

    await user.click(screen.getByRole("button", { name: "+ Add Post" }));
    await user.type(screen.getByLabelText("Post title"), "Calendar launch");
    await user.selectOptions(screen.getByLabelText("Platform"), "TikTok");
    await user.click(screen.getByRole("button", { name: "Add Post" }));

    expect(screen.getByRole("heading", { level: 1, name: "Calendar" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Calendar launch" })).toBeInTheDocument();
  });

  it("shows a message when a quick add cannot be saved", async () => {
    const user = userEvent.setup();
    const stored = createMemoryPostsRepository();
    const postsRepository: PostsRepository = {
      listPosts: stored.listPosts,
      createPost: async () => {
        throw new Error("This post could not be saved. Please try again.");
      },
      updatePost: stored.updatePost,
      deletePost: stored.deletePost,
    };

    await renderApp("/", appsWithForestTimer(), postsRepository);

    await user.click(screen.getByRole("button", { name: "+ Add Post" }));
    await user.type(screen.getByLabelText("Post title"), "Launch post");
    await user.selectOptions(screen.getByLabelText("Platform"), "Instagram");
    await user.click(screen.getByRole("button", { name: "Add Post" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This post could not be saved. Please try again.",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByLabelText("Post title")).toHaveValue("Launch post");
  });

  it("asks the user to add an app first", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(screen.getByRole("button", { name: "+ Add Post" }));

    expect(
      screen.getByText(/Add an App Store app before you create a post/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Add App" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Post" })).toBeDisabled();
  });
});
