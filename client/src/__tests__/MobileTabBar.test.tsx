import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MobileTabBar } from "../components/layout/MobileTabBar";

describe("MobileTabBar", () => {
  it("renders all three tabs", () => {
    render(<MobileTabBar />);
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Shifts")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders tabs as buttons", () => {
    render(<MobileTabBar />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("uses a nav element with aria-label", () => {
    render(<MobileTabBar />);
    const nav = screen.getByLabelText("Primary navigation");
    expect(nav).toBeInTheDocument();
    expect(nav.tagName).toBe("NAV");
  });

  it("is hidden on desktop (md:hidden)", () => {
    render(<MobileTabBar />);
    const nav = screen.getByLabelText("Primary navigation");
    expect(nav).toHaveClass("md:hidden");
  });

  it("is fixed to the bottom of the screen", () => {
    render(<MobileTabBar />);
    const nav = screen.getByLabelText("Primary navigation");
    expect(nav).toHaveClass("fixed", "inset-x-0", "bottom-0");
  });

  it("renders tabs in a 3-column grid", () => {
    const { container } = render(<MobileTabBar />);
    const grid = container.querySelector(".grid-cols-3");
    expect(grid).toBeInTheDocument();
  });

  it("renders tabs as list items", () => {
    const { container } = render(<MobileTabBar />);
    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(3);
  });

  it("tabs are clickable", async () => {
    const user = userEvent.setup();
    render(<MobileTabBar />);
    const scheduleBtn = screen.getByText("Schedule");
    await user.click(scheduleBtn);
    expect(scheduleBtn).toBeInTheDocument();
  });
});
