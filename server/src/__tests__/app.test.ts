import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("createApp", () => {
  it("returns an Express application", () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe("function");
  });

  it("parses JSON request bodies", async () => {
    const app = createApp();
    app.post("/test-json", (req, res) => {
      res.json({ received: req.body });
    });

    const response = await request(app)
      .post("/test-json")
      .send({ hello: "world" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.received).toEqual({ hello: "world" });
  });

  it("mounts the API router at /api", async () => {
    const app = createApp();
    const response = await request(app).get("/api/nonexistent");
    expect(response.status).toBe(404);
  });
});
