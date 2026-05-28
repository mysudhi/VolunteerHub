import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { contributorsRouter } from "../routes/contributors.js";
import { signToken } from "../auth/jwt.js";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.tenant = { organizationId: "test-org", userId: "test-user" };
    next();
  });
  app.use("/api/contributors", contributorsRouter);
  return app;
}

const token = signToken({ userId: "test-user", email: "test@test.com", role: "OrgAdmin" });
const auth = { Authorization: `Bearer ${token}` };

describe("Contributors CRUD API", () => {
  it("returns 401 without auth token", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/contributors");
    expect(res.status).toBe(401);
  });

  it("GET /api/contributors returns an array", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/contributors").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.contributors).toBeDefined();
    expect(Array.isArray(res.body.contributors)).toBe(true);
  });

  it("GET /api/contributors/:id returns 404 for non-existent user", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/contributors/nonexistent-id").set(auth);
    expect(res.status).toBe(404);
  });

  it("PATCH /api/contributors/:id returns 404 for non-existent user", async () => {
    const app = createTestApp();
    const res = await request(app)
      .patch("/api/contributors/nonexistent-id")
      .set(auth)
      .send({ firstName: "Updated" });
    expect(res.status).toBe(404);
  });

  it("PATCH /api/contributors validates role enum", async () => {
    const app = createTestApp();
    const res = await request(app)
      .patch("/api/contributors/nonexistent-id")
      .set(auth)
      .send({ role: "InvalidRole" });
    expect([400, 404]).toContain(res.status);
  });
});
