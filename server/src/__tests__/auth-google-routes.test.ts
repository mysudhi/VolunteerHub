import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { authRouter } from "../routes/auth.js";
import express from "express";

function createAuthApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  return app;
}

describe("GET /api/auth/google", () => {
  const origClientId = process.env.GOOGLE_CLIENT_ID;
  const origCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  afterEach(() => {
    if (origClientId) process.env.GOOGLE_CLIENT_ID = origClientId;
    else delete process.env.GOOGLE_CLIENT_ID;
    if (origCallbackUrl) process.env.GOOGLE_CALLBACK_URL = origCallbackUrl;
    else delete process.env.GOOGLE_CALLBACK_URL;
  });

  it("returns 503 when Google OAuth is not configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CALLBACK_URL;

    const app = createAuthApp();
    const res = await request(app).get("/api/auth/google");
    expect(res.status).toBe(503);
    expect(res.body.configured).toBe(false);
    expect(res.body.error).toBe("Google OAuth is not configured");
  });

  it("returns OAuth URL when configured", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
    process.env.GOOGLE_CALLBACK_URL = "http://localhost:4000/api/auth/google/callback";

    const app = createAuthApp();
    const res = await request(app).get("/api/auth/google");
    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(true);
    expect(res.body.url).toContain("accounts.google.com");
    expect(res.body.url).toContain("test-client-id");
  });
});

describe("GET /api/auth/google/status", () => {
  const origClientId = process.env.GOOGLE_CLIENT_ID;
  const origCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  afterEach(() => {
    if (origClientId) process.env.GOOGLE_CLIENT_ID = origClientId;
    else delete process.env.GOOGLE_CLIENT_ID;
    if (origCallbackUrl) process.env.GOOGLE_CALLBACK_URL = origCallbackUrl;
    else delete process.env.GOOGLE_CALLBACK_URL;
  });

  it("returns configured: false when env vars are missing", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CALLBACK_URL;

    const app = createAuthApp();
    const res = await request(app).get("/api/auth/google/status");
    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
  });

  it("returns configured: true when env vars are set", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-id";
    process.env.GOOGLE_CALLBACK_URL = "http://localhost:4000/api/auth/google/callback";

    const app = createAuthApp();
    const res = await request(app).get("/api/auth/google/status");
    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(true);
  });
});

describe("GET /api/auth/google/callback", () => {
  const origFrontendUrl = process.env.FRONTEND_URL;

  afterEach(() => {
    if (origFrontendUrl) process.env.FRONTEND_URL = origFrontendUrl;
    else delete process.env.FRONTEND_URL;
  });

  it("redirects to frontend with error when code is missing", async () => {
    process.env.FRONTEND_URL = "http://localhost:5173";

    const app = createAuthApp();
    const res = await request(app).get("/api/auth/google/callback");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("http://localhost:5173");
    expect(res.headers.location).toContain("auth_error=");
  });

  it("redirects to frontend with error when OAuth is not configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    process.env.FRONTEND_URL = "http://localhost:5173";

    const app = createAuthApp();
    const res = await request(app).get("/api/auth/google/callback?code=test-code");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("auth_error=");
  });
});
