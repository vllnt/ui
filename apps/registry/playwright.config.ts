import { defineConfig, devices } from "@playwright/test";

const PORT = 41599;
// When PLAYWRIGHT_BASE_URL is set, test that deployed instance and skip the
// local dev server.
// Unset (local/CI run) → spin up `pnpm dev` and test localhost.
const EXTERNAL_BASE_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Next dev's Turbopack cache can corrupt concurrently compiled JSON modules.
  // Production builds are parallel-safe; serialize local cold-start E2E only.
  fullyParallel: Boolean(process.env.CI || EXTERNAL_BASE_URL),
  workers: process.env.CI || EXTERNAL_BASE_URL ? undefined : 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    locale: "en-US",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(EXTERNAL_BASE_URL
    ? {}
    : {
        webServer: {
          command: `pnpm dev --port ${PORT}`,
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
