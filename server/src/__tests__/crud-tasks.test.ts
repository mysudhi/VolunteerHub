import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { tasksRouter } from "../routes/tasks.js";
import { signToken } from "../auth/jwt.js";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.tenant = { organizationId: "test-org", userId: "test-user" };
    next();
  });
  app.use("/api/tasks", tasksRouter);
  return app;
}

const token = signToken({ userId: "test-user", email: "test@test.com", role: "OrgAdmin" });
const auth = { Authorization: `Bearer ${token}` };

describe("Tasks CRUD API", () => {
  it("returns 401 without auth token", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  it("GET /api/tasks returns an array", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/tasks").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.tasks).toBeDefined();
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it("POST /api/tasks requires x-org-id", async () => {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => { req.tenant = {}; next(); });
    app.use("/api/tasks", tasksRouter);

    const res = await request(app)
      .post("/api/tasks")
      .set(auth)
      .send({ shiftId: "shift-1", title: "Test Task" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("x-org-id");
  });

  it("POST /api/tasks validates required fields", async () => {
    const app = createTestApp();
    const res = await request(app)
      .post("/api/tasks")
      .set(auth)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("GET /api/tasks/:id returns 404 for non-existent task", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/tasks/nonexistent-id").set(auth);
    expect(res.status).toBe(404);
  });

  it("PATCH /api/tasks/:id returns 404 for non-existent task", async () => {
    const app = createTestApp();
    const res = await request(app)
      .patch("/api/tasks/nonexistent-id")
      .set(auth)
      .send({ title: "Updated" });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/tasks/:id returns 404 for non-existent task", async () => {
    const app = createTestApp();
    const res = await request(app).delete("/api/tasks/nonexistent-id").set(auth);
    expect(res.status).toBe(404);
  });
});
