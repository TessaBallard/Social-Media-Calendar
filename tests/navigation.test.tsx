import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "./renderApp";

describe("B-001 navigation", () => {
  it("shows the dashboard as the home page", async () => {
    await renderApp("/");

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });

  it("moves between Dashboard, Calendar, Timeline, and Apps", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(screen.getByRole("link", { name: "Calendar" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Calendar" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Timeline" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Timeline" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Apps" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Apps" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("shows the 404 page for unknown routes", async () => {
    await renderApp("/does-not-exist");

    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeInTheDocument();
  });

  it("shows empty states instead of placeholder post data", async () => {
    await renderApp("/");

    expect(screen.getByText("No planned posts yet")).toBeInTheDocument();
    expect(screen.queryByText(/sample post/i)).not.toBeInTheDocument();
  });
});
