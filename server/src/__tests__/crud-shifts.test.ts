import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import { shiftsRouter } from "../routes/shifts.js";
import { signToken } from "../auth/jwt.js";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.tenant = { organizationId: "test-org", userId: "test-user" };
    next();
  });
  app.use("/api/shifts", shiftsRouter);
  return app;
}

const token = signToken({ userId: "test-user", email: "test@test.com", role: "OrgAdmin" });
const auth = { Authorization: `Bearer ${token}` };

describe("Shifts CRUD API", () => {
  it("returns 401 without auth token", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/shifts");
    expect(res.status).toBe(401);
  });

  it("GET /api/shifts returns an array", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/shifts").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.shifts).toBeDefined();
    expect(Array.isArray(res.body.shifts)).toBe(true);
  });

  it("POST /api/shifts requires x-org-id", async () => {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => { req.tenant = {}; next(); });
    app.use("/api/shifts", shiftsRouter);

    const res = await request(app)
      .post("/api/shifts")
      .set(auth)
      .send({
        title: "Test Shift",
        startsAt: "2026-06-01T09:00:00Z",
        endsAt: "2026-06-01T12:00:00Z"
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("x-org-id");
  });

  it("POST /api/shifts validates required fields", async () => {
    const app = createTestApp();
    const res = await request(app)
      .post("/api/shifts")
      .set(auth)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("GET /api/shifts/:id returns 404 for non-existent shift", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/shifts/nonexistent-id").set(auth);
    expect(res.status).toBe(404);
  });

  it("PATCH /api/shifts/:id returns 404 for non-existent shift", async () => {
    const app = createTestApp();
    const res = await request(app)
      .patch("/api/shifts/nonexistent-id")
      .set(auth)
      .send({ title: "Updated" });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/shifts/:id returns 404 for non-existent shift", async () => {
    const app = createTestApp();
    const res = await request(app).delete("/api/shifts/nonexistent-id").set(auth);
    expect(res.status).toBe(404);
  });
});
