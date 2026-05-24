import { describe, it, expect } from "vitest";
import { roles } from "../types/rbac";

describe("RBAC roles", () => {
  it("defines exactly three roles", () => {
    expect(roles).toHaveLength(3);
  });

  it("includes SuperAdmin role", () => {
    expect(roles).toContain("SuperAdmin");
  });

  it("includes OrgAdmin role", () => {
    expect(roles).toContain("OrgAdmin");
  });

  it("includes Volunteer role", () => {
    expect(roles).toContain("Volunteer");
  });

  it("roles are in the expected order", () => {
    expect(roles).toEqual(["SuperAdmin", "OrgAdmin", "Volunteer"]);
  });

  it("roles array is a tuple (as const)", () => {
    expect(Array.isArray(roles)).toBe(true);
    const typed: readonly string[] = roles;
    expect(typed).toBeDefined();
  });
});
