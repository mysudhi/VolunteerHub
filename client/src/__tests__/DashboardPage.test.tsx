import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardPage } from "../pages/DashboardPage";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: "Volunteer"
};

describe("DashboardPage", () => {
  it("renders a personalized welcome heading", () => {
    render(<DashboardPage user={mockUser} />);
    expect(screen.getByText("Welcome, Test!")).toBeInTheDocument();
  });

  it("displays the user email and role", () => {
    render(<DashboardPage user={mockUser} />);
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Volunteer/)).toBeInTheDocument();
  });

  it("renders the Upcoming Shifts heading", () => {
    render(<DashboardPage user={mockUser} />);
    expect(screen.getByText("Upcoming Shifts")).toBeInTheDocument();
  });

  it("renders all three mock shifts", () => {
    render(<DashboardPage user={mockUser} />);
    expect(screen.getByText("Food Drive")).toBeInTheDocument();
    expect(screen.getByText("Shelter Check-In")).toBeInTheDocument();
    expect(screen.getByText("Community Clinic")).toBeInTheDocument();
  });

  it("displays the correct times for each shift", () => {
    render(<DashboardPage user={mockUser} />);
    expect(screen.getByText("08:00 - 12:00")).toBeInTheDocument();
    expect(screen.getByText("13:00 - 17:00")).toBeInTheDocument();
    expect(screen.getByText("18:00 - 21:00")).toBeInTheDocument();
  });

  it("renders shift cards as article elements", () => {
    const { container } = render(<DashboardPage user={mockUser} />);
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(3);
  });
});
