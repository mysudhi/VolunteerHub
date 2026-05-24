import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../auth/password.js";

describe("Password utilities", () => {
  it("hashes a password to a bcrypt string", async () => {
    const hash = await hashPassword("mysecretpass");
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash.length).toBeGreaterThan(50);
  });

  it("produces different hashes for the same password", async () => {
    const hash1 = await hashPassword("samepass");
    const hash2 = await hashPassword("samepass");
    expect(hash1).not.toBe(hash2);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("correct-password", hash);
    expect(result).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("handles empty strings", async () => {
    const hash = await hashPassword("");
    const result = await verifyPassword("", hash);
    expect(result).toBe(true);
  });
});
