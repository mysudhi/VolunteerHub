import { describe, it, expect } from "vitest";
import { organizationThemeSchema } from "../schemas/organization";

describe("organizationThemeSchema", () => {
  it("accepts a valid theme with all fields", () => {
    const result = organizationThemeSchema.parse({
      logoUrl: "https://example.com/logo.png",
      primaryColor: "#ff5733",
      fontFamily: "Roboto"
    });

    expect(result.logoUrl).toBe("https://example.com/logo.png");
    expect(result.primaryColor).toBe("#ff5733");
    expect(result.fontFamily).toBe("Roboto");
  });

  it("applies default primaryColor when not provided", () => {
    const result = organizationThemeSchema.parse({
      fontFamily: "Inter"
    });

    expect(result.primaryColor).toBe("#2563eb");
  });

  it("applies default fontFamily when not provided", () => {
    const result = organizationThemeSchema.parse({
      primaryColor: "#000000"
    });

    expect(result.fontFamily).toBe("Inter");
  });

  it("allows logoUrl to be omitted", () => {
    const result = organizationThemeSchema.parse({
      primaryColor: "#123456",
      fontFamily: "Arial"
    });

    expect(result.logoUrl).toBeUndefined();
  });

  it("applies all defaults when given an empty object", () => {
    const result = organizationThemeSchema.parse({});

    expect(result.primaryColor).toBe("#2563eb");
    expect(result.fontFamily).toBe("Inter");
    expect(result.logoUrl).toBeUndefined();
  });

  it("rejects invalid hex color codes", () => {
    expect(() =>
      organizationThemeSchema.parse({ primaryColor: "red" })
    ).toThrow();
  });

  it("rejects hex colors without hash prefix", () => {
    expect(() =>
      organizationThemeSchema.parse({ primaryColor: "ff5733" })
    ).toThrow();
  });

  it("accepts 3-digit hex colors", () => {
    const result = organizationThemeSchema.parse({ primaryColor: "#f00" });
    expect(result.primaryColor).toBe("#f00");
  });

  it("accepts 6-digit hex colors", () => {
    const result = organizationThemeSchema.parse({ primaryColor: "#ff0000" });
    expect(result.primaryColor).toBe("#ff0000");
  });

  it("rejects invalid logoUrl", () => {
    expect(() =>
      organizationThemeSchema.parse({ logoUrl: "not-a-url" })
    ).toThrow();
  });

  it("rejects empty fontFamily", () => {
    expect(() =>
      organizationThemeSchema.parse({ fontFamily: "" })
    ).toThrow();
  });
});
