import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { addDays, todayStamp } from "../src/lib/calendarDate";
import { renderApp } from "./renderApp";

// B-020: Walk the complete planner the way a user would, without seeded production data.
describe("B-020 complete app", () => {
  it("creates apps, adds posts, changes statuses, uses the calendar, filters, and overdue", async () => {
    const user = userEvent.setup();
    const today = todayStamp();
    const overdueDate = addDays(today, -3);
    const upcomingDate = addDays(today, 2);

    await renderApp("/");
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Apps" }));
    await addApp(user, "Forest Timer", "https://apps.apple.com/app/id123");
    await addApp(user, "Tide Guide", "https://apps.apple.com/app/id456");
    expect(screen.getAllByText("0 planned posts")).toHaveLength(2);

    await user.click(screen.getByRole("link", { name: "Timeline" }));
    await addFullPost(user, {
      title: "Late recap",
      app: "Forest Timer",
      platform: "TikTok",
      dueDate: overdueDate,
      status: "Planned",
      priority: "Urgent",
    });
    await addFullPost(user, {
      title: "Launch reel",
      app: "Forest Timer",
      platform: "Instagram",
      dueDate: today,
      status: "Planned",
      priority: "Normal",
    });
    await addFullPost(user, {
      title: "Tide teaser",
      app: "Tide Guide",
      platform: "YouTube",
      dueDate: upcomingDate,
      status: "Ready",
      priority: "High",
    });

    const timeline = screen.getByRole("list", { name: "Posts in date order" });
    expect(within(timeline).getByRole("heading", { name: "Late recap" })).toBeInTheDocument();
    expect(within(timeline).getByRole("heading", { name: "Launch reel" })).toBeInTheDocument();
    expect(within(timeline).getByRole("heading", { name: "Tide teaser" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Overdue posts" })).getByRole("link", { name: "Late recap" })).toBeInTheDocument();

    await user.click(within(timeline).getByRole("link", { name: "Late recap" }));
    expect(screen.getByRole("heading", { level: 1, name: "Late recap" })).toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Status"), "In Progress");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Late recap" })).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Dashboard" }));
    const summary = screen.getByRole("region", { name: "Summary of planned posts" });
    expect(summary).toHaveTextContent("Overdue");
    expect(summary).toHaveTextContent("In progress");
    expect(within(screen.getByRole("list", { name: "Overdue posts" })).getByRole("link", { name: "Late recap" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Posts in progress" })).getByRole("link", { name: "Late recap" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Upcoming posts" })).getByRole("link", { name: "Launch reel" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Upcoming posts" })).getByRole("link", { name: "Tide teaser" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Calendar" }));
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Launch reel" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Overdue posts" })).getByRole("link", { name: "Late recap" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("region", { name: "Week calendar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Launch reel" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Day" }));
    expect(screen.getByRole("heading", { name: "Launch reel" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tide teaser" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Month" }));
    await user.selectOptions(screen.getByLabelText("Filter by app"), "Tide Guide");
    expect(screen.getByRole("link", { name: "Tide teaser" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Launch reel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Late recap" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.click(screen.getByRole("link", { name: "Timeline" }));
    await user.selectOptions(screen.getByLabelText("Filter by platform"), "TikTok");
    expect(screen.getByRole("heading", { name: "Late recap" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Launch reel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tide teaser" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.selectOptions(screen.getByLabelText("Filter by status"), "Ready");
    expect(screen.getByRole("heading", { name: "Tide teaser" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Late recap" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.click(
      within(screen.getByRole("list", { name: "Posts in date order" })).getByRole("link", {
        name: "Late recap",
      }),
    );
    await user.click(screen.getByRole("link", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Status"), "Posted");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Posted")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(screen.getByText("No overdue posts.")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Recently posted" })).getByRole("link", { name: "Late recap" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Apps" }));
    expect(screen.getByText("2 planned posts")).toBeInTheDocument();
    expect(screen.getByText("1 planned post")).toBeInTheDocument();
  });
});

async function addApp(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  storeUrl: string,
): Promise<void> {
  await user.click(screen.getByRole("link", { name: "+ Add App" }));
  await user.type(screen.getByLabelText("App name"), name);
  await user.type(screen.getByLabelText("App Store link"), storeUrl);
  await user.click(screen.getByRole("button", { name: "Add App" }));
  expect(await screen.findByRole("heading", { name })).toBeInTheDocument();
}

async function addFullPost(
  user: ReturnType<typeof userEvent.setup>,
  values: {
    title: string;
    app: string;
    platform: string;
    dueDate: string;
    status: string;
    priority: string;
  },
): Promise<void> {
  await user.click(screen.getByRole("link", { name: "+ Add Post" }));
  await user.type(screen.getByLabelText("Post title"), values.title);
  await user.selectOptions(screen.getByLabelText("App"), values.app);
  await user.selectOptions(screen.getByLabelText("Platform"), values.platform);
  await user.type(screen.getByLabelText("Due date"), values.dueDate);
  await user.selectOptions(screen.getByLabelText("Status"), values.status);
  await user.selectOptions(screen.getByLabelText("Priority"), values.priority);
  await user.click(screen.getByRole("button", { name: "Add Post" }));
  expect(await screen.findByRole("heading", { level: 1, name: "Timeline" })).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: values.title })).toBeInTheDocument();
}
