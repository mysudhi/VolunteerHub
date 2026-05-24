import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("tenantContextMiddleware", () => {
  function createTestApp() {
    const app = createApp();
    app.get("/test-tenant", (req, res) => {
      res.json({
        organizationId: req.tenant?.organizationId,
        userId: req.tenant?.userId
      });
    });
    return app;
  }

  it("attaches tenant context from x-org-id header", async () => {
    const app = createTestApp();
    const response = await request(app)
      .get("/test-tenant")
      .set("x-org-id", "org-123");

    expect(response.body.organizationId).toBe("org-123");
  });

  it("attaches user context from x-user-id header", async () => {
    const app = createTestApp();
    const response = await request(app)
      .get("/test-tenant")
      .set("x-user-id", "user-456");

    expect(response.body.userId).toBe("user-456");
  });

  it("attaches both org and user when both headers are present", async () => {
    const app = createTestApp();
    const response = await request(app)
      .get("/test-tenant")
      .set("x-org-id", "org-123")
      .set("x-user-id", "user-456");

    expect(response.body.organizationId).toBe("org-123");
    expect(response.body.userId).toBe("user-456");
  });

  it("sets undefined when no headers are provided", async () => {
    const app = createTestApp();
    const response = await request(app).get("/test-tenant");

    expect(response.body.organizationId).toBeUndefined();
    expect(response.body.userId).toBeUndefined();
  });

  it("passes through empty header values as-is", async () => {
    const app = createTestApp();
    const response = await request(app)
      .get("/test-tenant")
      .set("x-org-id", "");

    expect(response.body.organizationId).toBe("");
  });
});
