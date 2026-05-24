import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("API Router", () => {
  it("returns 404 for undefined API routes", async () => {
    const app = createApp();
    const response = await request(app).get("/api/unknown");
    expect(response.status).toBe(404);
  });

  it("returns 404 for nested undefined routes", async () => {
    const app = createApp();
    const response = await request(app).get("/api/users/123");
    expect(response.status).toBe(404);
  });

  it("returns 404 for POST to undefined API routes", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/api/shifts")
      .send({ title: "Test Shift" });
    expect(response.status).toBe(404);
  });

  it("returns 404 for non-API routes", async () => {
    const app = createApp();
    const response = await request(app).get("/nonexistent");
    expect(response.status).toBe(404);
  });

  it("includes tenant context in API requests", async () => {
    const app = createApp();
    app.use("/api/echo-tenant", (req, res) => {
      res.json({ tenant: req.tenant });
    });

    const response = await request(app)
      .get("/api/echo-tenant")
      .set("x-org-id", "org-test")
      .set("x-user-id", "user-test");

    expect(response.body.tenant).toEqual({
      organizationId: "org-test",
      userId: "user-test"
    });
  });
});
