import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import type { AppRecord } from "../src/types/appRecord";
import type { PostRecord, PostsRepository } from "../src/types/postRecord";
import { createMemoryAppsRepository } from "./memoryAppsRepository";
import { renderApp } from "./renderApp";

const forestTimer: AppRecord = {
  id: "app-1",
  name: "Forest Timer",
  storeUrl: "https://apps.apple.com/app/id123",
  notes: "Launch week",
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
    notes: "",
    content: "",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
    ...overrides,
  };
}

describe("B-015 app details and app-specific posts", () => {
  it("opens app details from the Apps page and shows that app's posts", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/apps",
      appsWithTwoApps(),
      createMemoryPostsRepository([
        post({ id: "forest", title: "Launch post", appId: "app-1" }),
        post({ id: "tide", title: "Tide post", appId: "app-2", platform: "TikTok" }),
      ]),
    );

    expect(screen.getAllByText("1 planned post")).toHaveLength(2);
    await user.click(screen.getByRole("link", { name: "Forest Timer" }));

    expect(screen.getByRole("heading", { level: 1, name: "Forest Timer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://apps.apple.com/app/id123" })).toHaveAttribute(
      "href",
      "https://apps.apple.com/app/id123",
    );
    expect(screen.getByText("Launch week")).toBeInTheDocument();

    const appPosts = screen.getByRole("list", { name: "Posts for Forest Timer" });
    expect(within(appPosts).getByRole("heading", { name: "Launch post" })).toBeInTheDocument();
    expect(within(appPosts).queryByRole("heading", { name: "Tide post" })).not.toBeInTheDocument();
  });

  it("says when an app has no posts yet", async () => {
    await renderApp("/apps/app-1", appsWithTwoApps(), createMemoryPostsRepository());

    expect(screen.getByRole("heading", { name: "No posts for this app" })).toBeInTheDocument();
  });

  it("says when the app cannot be found", async () => {
    await renderApp("/apps/missing-app", appsWithTwoApps());

    expect(screen.getByRole("heading", { level: 1, name: "App not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Apps" })).toBeInTheDocument();
  });

  it("says when posts for the app cannot be loaded", async () => {
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

    await renderApp("/apps/app-1", appsWithTwoApps(), postsRepository);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Posts could not be loaded. Please try again.",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Forest Timer" })).toBeInTheDocument();
  });

  it("adds a post for the selected app and returns to app details", async () => {
    const user = userEvent.setup();
    await renderApp("/apps/app-1", appsWithTwoApps(), createMemoryPostsRepository());

    await user.click(screen.getByRole("link", { name: "+ Add Post" }));
    expect(screen.getByLabelText("App")).toHaveValue("app-1");
    await user.type(screen.getByLabelText("Post title"), "Launch post");
    await user.selectOptions(screen.getByLabelText("Platform"), "Instagram");
    await user.type(screen.getByLabelText("Due date"), "2026-09-10");
    await user.click(screen.getByRole("button", { name: "Add Post" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Forest Timer" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Launch post" })).toBeInTheDocument();
  });

  it("opens a post from app details", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/apps/app-1",
      appsWithTwoApps(),
      createMemoryPostsRepository([post({ title: "Launch post" })]),
    );

    await user.click(screen.getByRole("link", { name: "View Post" }));
    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Forest Timer" }));
    expect(screen.getByRole("heading", { level: 1, name: "Forest Timer" })).toBeInTheDocument();
  });
});
