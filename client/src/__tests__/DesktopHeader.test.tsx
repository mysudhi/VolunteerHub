import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DesktopHeader } from "../components/layout/DesktopHeader";

describe("DesktopHeader", () => {
  it("renders the application name", () => {
    render(<DesktopHeader />);
    expect(screen.getByText("VolunteerHub")).toBeInTheDocument();
  });

  it("renders the Org Dashboard badge", () => {
    render(<DesktopHeader />);
    expect(screen.getByText("Org Dashboard")).toBeInTheDocument();
  });

  it("uses a header element", () => {
    const { container } = render(<DesktopHeader />);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("is hidden on mobile (md:flex)", () => {
    const { container } = render(<DesktopHeader />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("hidden", "md:flex");
  });

  it("has a bottom border", () => {
    const { container } = render(<DesktopHeader />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("border-b", "border-slate-200");
  });

  it("renders app name as an h1 element", () => {
    render(<DesktopHeader />);
    const heading = screen.getByText("VolunteerHub");
    expect(heading.tagName).toBe("H1");
  });

  it("renders the badge with blue styling", () => {
    render(<DesktopHeader />);
    const badge = screen.getByText("Org Dashboard");
    expect(badge).toHaveClass("bg-blue-50", "text-blue-700");
  });
});
