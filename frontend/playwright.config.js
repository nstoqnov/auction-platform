// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * End-to-end tests run against a *running* app.
 * Point them at your app with E2E_BASE_URL (defaults to the CRA dev server on :3000).
 * See e2e/README.md for how to run.
 */
module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
