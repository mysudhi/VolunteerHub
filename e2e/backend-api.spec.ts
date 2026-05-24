import { test, expect } from "@playwright/test";

const API_BASE = "http://localhost:4000";

test.describe("Backend API - Health Check", () => {
  test("GET /health returns 200", async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.status()).toBe(200);
  });

  test("GET /health returns JSON with status ok", async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    const body = await response.json();
    expect(body).toEqual({ status: "ok" });
  });

  test("GET /health returns correct content type", async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });
});

test.describe("Backend API - Tenant Context", () => {
  test("API accepts x-org-id header without error", async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`, {
      headers: { "x-org-id": "test-org" }
    });
    expect(response.status()).toBe(200);
  });

  test("API accepts x-user-id header without error", async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`, {
      headers: { "x-user-id": "test-user" }
    });
    expect(response.status()).toBe(200);
  });

  test("API accepts both tenant headers together", async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`, {
      headers: {
        "x-org-id": "test-org",
        "x-user-id": "test-user"
      }
    });
    expect(response.status()).toBe(200);
  });
});

test.describe("Backend API - 404 Handling", () => {
  test("returns 404 for undefined routes", async ({ request }) => {
    const response = await request.get(`${API_BASE}/nonexistent`);
    expect(response.status()).toBe(404);
  });

  test("returns 404 for undefined API routes", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/unknown`);
    expect(response.status()).toBe(404);
  });

  test("returns 404 for POST to undefined API routes", async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/shifts`, {
      data: { title: "Test Shift" }
    });
    expect(response.status()).toBe(404);
  });
});

test.describe("Backend API - JSON Parsing", () => {
  test("accepts JSON content-type on POST requests", async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/test`, {
      headers: { "Content-Type": "application/json" },
      data: { key: "value" }
    });
    expect(response.status()).toBe(404);
  });
});
