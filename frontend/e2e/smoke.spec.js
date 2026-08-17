// @ts-check
const { test, expect } = require("@playwright/test");

/**
 * Smoke journey — the SPA loads and client-side routing works.
 * This deliberately avoids depending on seeded backend data so it can run against
 * just the frontend. Extend it (log in → place a bid → see the live update) once
 * you point it at a full stack. Selectors below may need tweaking to match your
 * exact markup — run `npm run test:e2e` and adjust.
 */

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  // The app shell renders (a nav landmark is always present).
  await expect(page.getByRole("navigation")).toBeVisible();
});

test("can navigate to the auctions listing", async ({ page }) => {
  await page.goto("/auctions");
  await expect(page).toHaveURL(/\/auctions$/);
  // The auctions page renders its own main content region.
  await expect(page.getByRole("main")).toBeVisible();
});

test("unknown route shows the 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByText(/could not be found/i)).toBeVisible();
});
