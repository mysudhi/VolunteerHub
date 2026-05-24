import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../auth/jwt.js";

describe("JWT utilities", () => {
  const payload = { userId: "user-123", email: "test@example.com", role: "Volunteer" };

  it("signs a token that can be verified", () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("user-123");
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.role).toBe("Volunteer");
  });

  it("produces a valid JWT string with three parts", () => {
    const token = signToken(payload);
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  it("throws on invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });

  it("throws on tampered token", () => {
    const token = signToken(payload);
    const tampered = token.slice(0, -5) + "xxxxx";
    expect(() => verifyToken(tampered)).toThrow();
  });

  it("includes iat and exp claims", () => {
    const token = signToken(payload);
    const decoded = verifyToken(token) as Record<string, unknown>;
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });
});
