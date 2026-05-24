import { test, expect } from "@playwright/test";

const API_BASE = "http://localhost:4000";

test.describe("Full Stack - Frontend and Backend Integration", () => {
  test("frontend and backend are both reachable", async ({ page, request }) => {
    const frontendResponse = await page.goto("/");
    expect(frontendResponse?.status()).toBe(200);

    const backendResponse = await request.get(`${API_BASE}/health`);
    expect(backendResponse.status()).toBe(200);
  });

  test("frontend renders while backend is healthy", async ({ page, request }) => {
    const healthResponse = await request.get(`${API_BASE}/health`);
    const health = await healthResponse.json();
    expect(health.status).toBe("ok");

    await page.goto("/");
    await expect(page.getByText("Upcoming Shifts")).toBeVisible();
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("complete page structure renders correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "VolunteerHub" })).toBeAttached();
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
    await expect(page.getByText("Upcoming Shifts")).toBeVisible();
    await expect(page.getByText("Food Drive")).toBeVisible();
    await expect(page.getByText("Shelter Check-In")).toBeVisible();
    await expect(page.getByText("Community Clinic")).toBeVisible();
    await expect(page.getByLabel("Primary navigation")).toBeAttached();
  });
});

test.describe("Full Stack - User Journeys", () => {
  test("new visitor sees login and shifts overview", async ({ page }) => {
    await page.goto("/");

    const loginSection = page.getByText("Welcome back");
    await expect(loginSection).toBeVisible();

    const googleButton = page.getByRole("button", { name: /continue with google/i });
    await expect(googleButton).toBeVisible();

    const shifts = page.locator("article");
    await expect(shifts).toHaveCount(3);

    const firstShift = shifts.first();
    await expect(firstShift).toContainText("Food Drive");
    await expect(firstShift).toContainText("08:00 - 12:00");
  });

  test("page loads quickly (under 3 seconds)", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await expect(page.getByText("Upcoming Shifts")).toBeVisible();
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });

  test("page has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });
});
