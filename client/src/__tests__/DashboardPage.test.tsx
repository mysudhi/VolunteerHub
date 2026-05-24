import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardPage } from "../pages/DashboardPage";

describe("DashboardPage", () => {
  it("renders the section heading", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Upcoming Shifts")).toBeInTheDocument();
  });

  it("renders all three mock shifts", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Food Drive")).toBeInTheDocument();
    expect(screen.getByText("Shelter Check-In")).toBeInTheDocument();
    expect(screen.getByText("Community Clinic")).toBeInTheDocument();
  });

  it("displays the correct times for each shift", () => {
    render(<DashboardPage />);
    expect(screen.getByText("08:00 - 12:00")).toBeInTheDocument();
    expect(screen.getByText("13:00 - 17:00")).toBeInTheDocument();
    expect(screen.getByText("18:00 - 21:00")).toBeInTheDocument();
  });

  it("renders shift cards as article elements", () => {
    const { container } = render(<DashboardPage />);
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(3);
  });

  it("applies grid layout classes", () => {
    const { container } = render(<DashboardPage />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("gap-3", "sm:grid-cols-2", "lg:grid-cols-3");
  });

  it("renders shift cards with shadow styling", () => {
    const { container } = render(<DashboardPage />);
    const cards = container.querySelectorAll(".shadow-sm");
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });
});
