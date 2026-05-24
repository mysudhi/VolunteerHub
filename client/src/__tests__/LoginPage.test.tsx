import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { LoginPage } from "../pages/LoginPage";

describe("LoginPage", () => {
  it("renders the welcome heading", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders the Google sign-in button", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with google/i });
    expect(button).toBeInTheDocument();
  });

  it("renders the button with correct type attribute", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with google/i });
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders the button with styling classes", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with google/i });
    expect(button).toHaveClass("bg-blue-600", "text-white", "rounded-lg");
  });

  it("renders within a section wrapper", () => {
    const { container } = render(<LoginPage />);
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("rounded-xl", "bg-white", "shadow-sm");
  });

  it("button is clickable", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with google/i });
    await user.click(button);
    expect(button).toBeInTheDocument();
  });
});
