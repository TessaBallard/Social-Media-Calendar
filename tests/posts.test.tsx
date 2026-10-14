import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { AppRecord } from "../src/types/appRecord";
import type { PostRecord, PostsRepository } from "../src/types/postRecord";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
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

describe("B-004 add and edit post", () => {
  it("opens the Add Post form from the Calendar page", async () => {
    const user = userEvent.setup();
    await renderApp("/calendar", appsWithForestTimer());

    await user.click(screen.getByRole("button", { name: "+ Add Post" }));

    expect(screen.getByRole("heading", { level: 1, name: "Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quick add" })).toBeInTheDocument();
    expect(screen.getByLabelText("Post title")).toBeInTheDocument();
    expect(screen.getByLabelText("App")).toBeInTheDocument();
    expect(screen.getByLabelText("Platform")).toBeInTheDocument();
    expect(screen.getByLabelText("Due date")).toBeInTheDocument();
  });

  it("opens the Add Post form from the Timeline page", async () => {
    const user = userEvent.setup();
    await renderApp("/timeline", appsWithForestTimer());

    await user.click(screen.getByRole("link", { name: "+ Add Post" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Add Post" }),
    ).toBeInTheDocument();
  });

  it("shows a message when required post details are missing", async () => {
    const user = userEvent.setup();
    await renderApp("/posts/new", appsWithForestTimer());

    await user.click(screen.getByRole("button", { name: "Add Post" }));

    expect(screen.getByText("Enter a post title.")).toBeInTheDocument();
    expect(screen.getByText("Select a social media platform.")).toBeInTheDocument();
    expect(screen.getByText("Enter a due date.")).toBeInTheDocument();
  });

  it("asks the user to add an app first when none exist", async () => {
    await renderApp("/posts/new");

    expect(
      screen.getByText(/Add an App Store app before you create a post/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Add App" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Post" })).toBeDisabled();
  });

  it("adds a post and shows it on the Timeline", async () => {
    const user = userEvent.setup();
    await renderApp("/timeline", appsWithForestTimer());

    await user.click(screen.getByRole("link", { name: "+ Add Post" }));
    await user.type(screen.getByLabelText("Post title"), "Launch post");
    await user.selectOptions(screen.getByLabelText("Platform"), "Instagram");
    await user.type(screen.getByLabelText("Due date"), "2026-09-10");
    await user.type(screen.getByLabelText("Notes (optional)"), "Film in the morning");
    await user.click(screen.getByRole("button", { name: "Add Post" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Timeline" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Launch post" }),
    ).toBeInTheDocument();
    const timeline = screen.getByRole("list", { name: "Posts in date order" });
    expect(within(timeline).getByText("Forest Timer")).toBeInTheDocument();
    expect(within(timeline).getByText("Due 2026-09-10")).toBeInTheDocument();
    expect(within(timeline).getByText("Platform")).toBeInTheDocument();
    expect(within(timeline).getByText("Instagram")).toBeInTheDocument();
    expect(within(timeline).getByText("Status")).toBeInTheDocument();
    expect(within(timeline).getByText("Planned")).toBeInTheDocument();
    expect(within(timeline).getByText("Priority")).toBeInTheDocument();
    expect(within(timeline).getByText("Normal")).toBeInTheDocument();
  });

  it("edits an existing post", async () => {
    const user = userEvent.setup();
    await renderApp("/timeline", appsWithForestTimer());

    await user.click(screen.getByRole("link", { name: "+ Add Post" }));
    await user.type(screen.getByLabelText("Post title"), "Launch post");
    await user.selectOptions(screen.getByLabelText("Platform"), "Instagram");
    await user.type(screen.getByLabelText("Due date"), "2026-09-10");
    await user.click(screen.getByRole("button", { name: "Add Post" }));

    await user.click(await screen.findByRole("link", { name: "View Post" }));
    await user.click(screen.getByRole("link", { name: "Edit" }));
    const titleInput = screen.getByLabelText("Post title");
    await user.clear(titleInput);
    await user.type(titleInput, "Launch week post");
    await user.selectOptions(screen.getByLabelText("Status"), "In Progress");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByRole("heading", { name: "Launch week post" }),
    ).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Launch post" })).not.toBeInTheDocument();
  });

  it("shows an error when the post to edit cannot be found", async () => {
    await renderApp("/posts/missing-post/edit", appsWithForestTimer());

    expect(
      await screen.findByRole("heading", { level: 1, name: "Post not found" }),
    ).toBeInTheDocument();
  });
});

describe("B-007 social media platform", () => {
  const savedPost: PostRecord = {
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
  };

  it("lists the social media platforms on the Add Post form", async () => {
    await renderApp("/posts/new", appsWithForestTimer());

    expect(screen.getByRole("option", { name: "Instagram" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Facebook" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "TikTok" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "YouTube" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "X" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Other" })).toBeInTheDocument();
  });

  it("shows a labelled platform on the Timeline", async () => {
    await renderApp(
      "/timeline",
      appsWithForestTimer(),
      createMemoryPostsRepository([savedPost]),
    );

    const timeline = screen.getByRole("list", { name: "Posts in date order" });
    expect(within(timeline).getByText("Platform")).toBeInTheDocument();
    expect(within(timeline).getByText("Instagram")).toBeInTheDocument();
  });

  it("keeps the current platform when a save fails", async () => {
    const user = userEvent.setup();
    const stored = createMemoryPostsRepository([savedPost]);
    const postsRepository: PostsRepository = {
      listPosts: stored.listPosts,
      createPost: stored.createPost,
      updatePost: async () => {
        throw new Error("This post could not be saved. Please try again.");
      },
      deletePost: stored.deletePost,
    };

    await renderApp("/posts/post-1/edit", appsWithForestTimer(), postsRepository);

    await user.selectOptions(screen.getByLabelText("Platform"), "TikTok");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The platform could not be saved. The current platform was kept.",
    );
    expect(screen.getByLabelText("Platform")).toHaveValue("Instagram");
  });
});

describe("B-006 post status and priority", () => {
  const savedPost: PostRecord = {
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
  };

  it("shows labelled status and priority on the Timeline", async () => {
    await renderApp(
      "/timeline",
      appsWithForestTimer(),
      createMemoryPostsRepository([savedPost]),
    );

    const timeline = screen.getByRole("list", { name: "Posts in date order" });
    expect(within(timeline).getByText("Status")).toBeInTheDocument();
    expect(within(timeline).getByText("Planned")).toBeInTheDocument();
    expect(within(timeline).getByText("Priority")).toBeInTheDocument();
    expect(within(timeline).getByText("Normal")).toBeInTheDocument();
  });

  it("keeps the current status and priority when a save fails", async () => {
    const user = userEvent.setup();
    const stored = createMemoryPostsRepository([savedPost]);
    const postsRepository: PostsRepository = {
      listPosts: stored.listPosts,
      createPost: stored.createPost,
      updatePost: async () => {
        throw new Error("This post could not be saved. Please try again.");
      },
      deletePost: stored.deletePost,
    };

    await renderApp("/posts/post-1/edit", appsWithForestTimer(), postsRepository);

    await user.selectOptions(screen.getByLabelText("Status"), "Posted");
    await user.selectOptions(screen.getByLabelText("Priority"), "Urgent");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The status and priority could not be saved. The current values were kept.",
    );
    expect(screen.getByLabelText("Platform")).toHaveValue("Instagram");
    expect(screen.getByLabelText("Status")).toHaveValue("Planned");
    expect(screen.getByLabelText("Priority")).toHaveValue("Normal");
  });
});

describe("B-005 post storage", () => {
  it("keeps an added post after the Timeline is opened again", async () => {
    const user = userEvent.setup();
    const postsRepository = createMemoryPostsRepository();
    const { unmount } = await renderApp("/timeline", appsWithForestTimer(), postsRepository);

    await user.click(screen.getByRole("link", { name: "+ Add Post" }));
    await user.type(screen.getByLabelText("Post title"), "Launch post");
    await user.selectOptions(screen.getByLabelText("Platform"), "Instagram");
    await user.type(screen.getByLabelText("Due date"), "2026-09-10");
    await user.click(screen.getByRole("button", { name: "Add Post" }));
    expect(await screen.findByRole("heading", { name: "Launch post" })).toBeInTheDocument();

    unmount();
    await renderApp("/timeline", appsWithForestTimer(), postsRepository);

    expect(await screen.findByRole("heading", { name: "Launch post" })).toBeInTheDocument();
  });

  it("shows an error when posts cannot be loaded", async () => {
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

  it("can retry after a load error", async () => {
    const user = userEvent.setup();
    let shouldFail = true;
    const stored = createMemoryPostsRepository();
    const postsRepository: PostsRepository = {
      listPosts: async () => {
        if (shouldFail) {
          throw new Error("Posts could not be loaded. Please try again.");
        }

        return stored.listPosts();
      },
      createPost: stored.createPost,
      updatePost: stored.updatePost,
      deletePost: stored.deletePost,
    };

    await renderApp("/timeline", appsWithForestTimer(), postsRepository);
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    shouldFail = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("No posts on the timeline")).toBeInTheDocument();
  });
});

describe("B-008 post details, edit, and delete", () => {
  const savedPost: PostRecord = {
    id: "post-1",
    title: "Launch post",
    appId: "app-1",
    platform: "Instagram",
    dueDate: "2026-09-10",
    status: "Planned",
    priority: "Normal",
    notes: "Film in the morning",
    content: "See you there",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
  };

  it("opens post details from the Timeline", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/timeline",
      appsWithForestTimer(),
      createMemoryPostsRepository([savedPost]),
    );

    await user.click(screen.getByRole("link", { name: "View Post" }));

    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
    expect(screen.getByText("App")).toBeInTheDocument();
    expect(screen.getByText("Forest Timer")).toBeInTheDocument();
    expect(screen.getByText("Due date")).toBeInTheDocument();
    expect(screen.getByText("2026-09-10")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Film in the morning")).toBeInTheDocument();
    expect(screen.getByText("Post content")).toBeInTheDocument();
    expect(screen.getByText("See you there")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Add Post" })).toBeInTheDocument();
  });

  it("opens Add Post from post details", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/posts/post-1",
      appsWithForestTimer(),
      createMemoryPostsRepository([savedPost]),
    );

    await user.click(screen.getByRole("link", { name: "+ Add Post" }));

    expect(screen.getByRole("heading", { level: 1, name: "Add Post" })).toBeInTheDocument();
  });

  it("asks for confirmation before deleting a post", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/posts/post-1",
      appsWithForestTimer(),
      createMemoryPostsRepository([savedPost]),
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog", { name: "Delete this post?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep Post" }));

    expect(screen.queryByRole("dialog", { name: "Delete this post?" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
  });

  it("closes the delete confirmation with Escape", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/posts/post-1",
      appsWithForestTimer(),
      createMemoryPostsRepository([savedPost]),
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog", { name: "Delete this post?" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Delete this post?" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
  });

  it("deletes a post after confirmation", async () => {
    const user = userEvent.setup();
    await renderApp(
      "/posts/post-1",
      appsWithForestTimer(),
      createMemoryPostsRepository([savedPost]),
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete Post" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Timeline" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Launch post" })).not.toBeInTheDocument();
    expect(screen.getByText("No posts on the timeline")).toBeInTheDocument();
  });

  it("shows a message when a post cannot be deleted", async () => {
    const user = userEvent.setup();
    const stored = createMemoryPostsRepository([savedPost]);
    const postsRepository: PostsRepository = {
      listPosts: stored.listPosts,
      createPost: stored.createPost,
      updatePost: stored.updatePost,
      deletePost: async () => {
        throw new Error("This post could not be deleted. Please try again.");
      },
    };

    await renderApp("/posts/post-1", appsWithForestTimer(), postsRepository);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete Post" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This post could not be deleted. Please try again.",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Launch post" })).toBeInTheDocument();
  });

  it("shows an error when the post cannot be found", async () => {
    await renderApp("/posts/missing-post", appsWithForestTimer());

    expect(
      await screen.findByRole("heading", { level: 1, name: "Post not found" }),
    ).toBeInTheDocument();
  });
});
