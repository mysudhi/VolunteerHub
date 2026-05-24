import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { authRequired, optionalAuth } from "../middleware/auth.js";
import { signToken } from "../auth/jwt.js";

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get("/protected", authRequired, (req, res) => {
    res.json({ user: req.user });
  });

  app.get("/optional", optionalAuth, (req, res) => {
    res.json({ user: req.user ?? null });
  });

  return app;
}

describe("authRequired middleware", () => {
  it("returns 401 without Authorization header", async () => {
    const app = createTestApp();
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication required");
  });

  it("returns 401 with non-Bearer token", async () => {
    const app = createTestApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Basic abc123");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const app = createTestApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  it("passes with valid token and attaches user", async () => {
    const app = createTestApp();
    const token = signToken({ userId: "u1", email: "a@b.com", role: "Volunteer" });
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.userId).toBe("u1");
    expect(res.body.user.email).toBe("a@b.com");
  });
});

describe("optionalAuth middleware", () => {
  it("proceeds without auth header, user is null", async () => {
    const app = createTestApp();
    const res = await request(app).get("/optional");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it("proceeds with invalid token, user is null", async () => {
    const app = createTestApp();
    const res = await request(app)
      .get("/optional")
      .set("Authorization", "Bearer bad-token");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it("attaches user with valid token", async () => {
    const app = createTestApp();
    const token = signToken({ userId: "u2", email: "b@c.com", role: "OrgAdmin" });
    const res = await request(app)
      .get("/optional")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.userId).toBe("u2");
  });
});
