import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LoginPage } from "../pages/LoginPage";

const mockOnLogin = vi.fn();

describe("LoginPage", () => {
  it("renders the welcome heading in login mode", () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("renders the Sign in button", () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the Continue with Google button", () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("switches to registration mode on Sign up click", async () => {
    const user = userEvent.setup();
    render(<LoginPage onLogin={mockOnLogin} />);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows name fields in registration mode", async () => {
    const user = userEvent.setup();
    render(<LoginPage onLogin={mockOnLogin} />);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
  });
});
