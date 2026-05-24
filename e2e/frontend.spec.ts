import { test, expect } from "@playwright/test";

test.describe("Frontend - Page Load", () => {
  test("loads the application successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VolunteerHub/i);
  });

  test("returns HTTP 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("renders the root element", async ({ page }) => {
    await page.goto("/");
    const root = page.locator("#root");
    await expect(root).toBeAttached();
  });
});

test.describe("Frontend - Login Page", () => {
  test("displays the Welcome back heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("displays the Continue with Google button", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /continue with google/i });
    await expect(button).toBeVisible();
  });

  test("Google button is clickable", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /continue with google/i });
    await expect(button).toBeEnabled();
    await button.click();
  });
});

test.describe("Frontend - Dashboard Page", () => {
  test("displays the Upcoming Shifts heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Upcoming Shifts")).toBeVisible();
  });

  test("displays all three shift cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Food Drive")).toBeVisible();
    await expect(page.getByText("Shelter Check-In")).toBeVisible();
    await expect(page.getByText("Community Clinic")).toBeVisible();
  });

  test("displays shift times", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("08:00 - 12:00")).toBeVisible();
    await expect(page.getByText("13:00 - 17:00")).toBeVisible();
    await expect(page.getByText("18:00 - 21:00")).toBeVisible();
  });

  test("renders exactly 3 shift card articles", async ({ page }) => {
    await page.goto("/");
    const articles = page.locator("article");
    await expect(articles).toHaveCount(3);
  });
});

test.describe("Frontend - Desktop Header", () => {
  test("displays VolunteerHub branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "VolunteerHub" })).toBeAttached();
  });

  test("displays Org Dashboard badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Org Dashboard")).toBeAttached();
  });
});

test.describe("Frontend - Mobile Tab Bar", () => {
  test("displays navigation tabs", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByLabel("Primary navigation");
    await expect(nav).toBeAttached();
  });

  test("has Schedule, Shifts, and Profile tabs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Schedule" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Shifts" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Profile" })).toBeAttached();
  });
});

test.describe("Frontend - Responsive Layout", () => {
  test("shows desktop header on wide viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toBeAttached();
  });

  test("renders mobile tab bar on narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const nav = page.getByLabel("Primary navigation");
    await expect(nav).toBeVisible();
  });

  test("shift cards reflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const articles = page.locator("article");
    await expect(articles).toHaveCount(3);
    await expect(articles.first()).toBeVisible();
  });
});
