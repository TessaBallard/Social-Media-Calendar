import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { AppsRepository } from "../src/types/appRecord";
import { createMemoryAppsRepository } from "./memoryAppsRepository";
import { renderApp } from "./renderApp";

describe("B-002 add and edit app", () => {
  it("opens the Add App form from the Apps page", async () => {
    const user = userEvent.setup();
    await renderApp("/apps");

    await user.click(screen.getByRole("link", { name: "+ Add App" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Add App" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("App name")).toBeInTheDocument();
    expect(screen.getByLabelText("App Store link")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes (optional)")).toBeInTheDocument();
  });

  it("shows a message when required app details are missing", async () => {
    const user = userEvent.setup();
    await renderApp("/apps/new");

    await user.click(screen.getByRole("button", { name: "Add App" }));

    expect(screen.getByText("Enter an app name.")).toBeInTheDocument();
    expect(screen.getByText("Enter an App Store link.")).toBeInTheDocument();
  });

  it("adds an app and shows it on the Apps page", async () => {
    const user = userEvent.setup();
    await renderApp("/apps");

    await user.click(screen.getByRole("link", { name: "+ Add App" }));
    await user.type(screen.getByLabelText("App name"), "Forest Timer");
    await user.type(
      screen.getByLabelText("App Store link"),
      "https://apps.apple.com/app/id123",
    );
    await user.type(screen.getByLabelText("Notes (optional)"), "Launch week");
    await user.click(screen.getByRole("button", { name: "Add App" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Apps" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Forest Timer" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://apps.apple.com/app/id123" })).toHaveAttribute(
      "href",
      "https://apps.apple.com/app/id123",
    );
    expect(screen.getByText("Launch week")).toBeInTheDocument();
    expect(screen.getByText("0 planned posts")).toBeInTheDocument();
  });

  it("edits an existing app", async () => {
    const user = userEvent.setup();
    await renderApp("/apps");

    await user.click(screen.getByRole("link", { name: "+ Add App" }));
    await user.type(screen.getByLabelText("App name"), "Forest Timer");
    await user.type(
      screen.getByLabelText("App Store link"),
      "https://apps.apple.com/app/id123",
    );
    await user.click(screen.getByRole("button", { name: "Add App" }));

    await user.click(await screen.findByRole("link", { name: "Edit App" }));
    const nameInput = screen.getByLabelText("App name");
    await user.clear(nameInput);
    await user.type(nameInput, "Forest Timer Plus");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByRole("heading", { name: "Forest Timer Plus" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Forest Timer" })).not.toBeInTheDocument();
  });

  it("shows an error when the app to edit cannot be found", async () => {
    await renderApp("/apps/missing-app/edit");

    expect(
      await screen.findByRole("heading", { level: 1, name: "App not found" }),
    ).toBeInTheDocument();
  });
});

describe("B-003 app storage", () => {
  it("keeps an added app after the Apps page is opened again", async () => {
    const user = userEvent.setup();
    const repository = createMemoryAppsRepository();
    const { unmount } = await renderApp("/apps", repository);

    await user.click(screen.getByRole("link", { name: "+ Add App" }));
    await user.type(screen.getByLabelText("App name"), "Forest Timer");
    await user.type(
      screen.getByLabelText("App Store link"),
      "https://apps.apple.com/app/id123",
    );
    await user.click(screen.getByRole("button", { name: "Add App" }));
    expect(await screen.findByRole("heading", { name: "Forest Timer" })).toBeInTheDocument();

    unmount();
    await renderApp("/apps", repository);

    expect(await screen.findByRole("heading", { name: "Forest Timer" })).toBeInTheDocument();
  });

  it("shows an error when apps cannot be loaded", async () => {
    const repository: AppsRepository = {
      listApps: async () => {
        throw new Error("Apps could not be loaded. Please try again.");
      },
      createApp: async () => {
        throw new Error("This app could not be saved. Please try again.");
      },
      updateApp: async () => {
        throw new Error("This app could not be saved. Please try again.");
      },
    };

    await renderApp("/apps", repository);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Apps could not be loaded. Please try again.",
    );
  });

  it("can retry after a load error", async () => {
    const user = userEvent.setup();
    let shouldFail = true;
    const stored = createMemoryAppsRepository();
    const repository: AppsRepository = {
      listApps: async () => {
        if (shouldFail) {
          throw new Error("Apps could not be loaded. Please try again.");
        }

        return stored.listApps();
      },
      createApp: stored.createApp,
      updateApp: stored.updateApp,
    };

    await renderApp("/apps", repository);
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    shouldFail = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("No apps yet")).toBeInTheDocument();
  });
});
