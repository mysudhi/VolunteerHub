import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DesktopHeader } from "../components/layout/DesktopHeader";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  firstName: "Alice",
  lastName: "Smith",
  role: "Volunteer"
};

describe("DesktopHeader", () => {
  it("renders the application name", () => {
    render(<DesktopHeader user={null} onLogout={vi.fn()} />);
    expect(screen.getByText("ContributorHub")).toBeInTheDocument();
  });

  it("shows Org Dashboard badge when not logged in", () => {
    render(<DesktopHeader user={null} onLogout={vi.fn()} />);
    expect(screen.getByText("Org Dashboard")).toBeInTheDocument();
  });

  it("shows user name when logged in", () => {
    render(<DesktopHeader user={mockUser} onLogout={vi.fn()} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("shows Sign out button when logged in", () => {
    render(<DesktopHeader user={mockUser} onLogout={vi.fn()} />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("calls onLogout when Sign out is clicked", async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    render(<DesktopHeader user={mockUser} onLogout={onLogout} />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("uses a header element", () => {
    const { container } = render(<DesktopHeader user={null} onLogout={vi.fn()} />);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("renders app name as an h1 element", () => {
    render(<DesktopHeader user={null} onLogout={vi.fn()} />);
    const heading = screen.getByText("ContributorHub");
    expect(heading.tagName).toBe("H1");
  });
});
