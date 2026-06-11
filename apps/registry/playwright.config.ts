import { defineConfig, devices } from "@playwright/test";

const PORT = 41599;
// When PLAYWRIGHT_BASE_URL is set (the ntk promote e2e gate points it at the
// live preview URL) test that deployed instance and skip the local dev server.
// Unset (local/CI run) → spin up `pnpm dev` and test localhost.
const EXTERNAL_BASE_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
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
