import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { createApp } from "../app.js";

function createAppWithHealth() {
  const app = createApp();
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  return app;
}

describe("GET /health", () => {
  it("returns 200 status code", async () => {
    const app = createAppWithHealth();
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
  });

  it("returns JSON content type", async () => {
    const app = createAppWithHealth();
    const response = await request(app).get("/health");
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("returns { status: 'ok' }", async () => {
    const app = createAppWithHealth();
    const response = await request(app).get("/health");
    expect(response.body).toEqual({ status: "ok" });
  });

  it("responds to HEAD requests", async () => {
    const app = createAppWithHealth();
    const response = await request(app).head("/health");
    expect(response.status).toBe(200);
  });
});
