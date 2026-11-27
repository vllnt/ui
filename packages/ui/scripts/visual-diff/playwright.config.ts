import { defineConfig } from "playwright/test";

/** Settings for one visual-diff capture pass; `run.mjs` sets the env. */
const environment = (name: string, fallback: string) =>
  process.env[`VISUAL_DIFF_${name}`] ?? fallback;
const port = Number(environment("PORT", "6107"));

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 0,
      scale: "css",
      threshold: 0.1,
    },
  },
  fullyParallel: true,
  outputDir: environment("OUTPUT", ".visual-diff/results"),
  reporter: [
    ["dot"],
    ["json", { outputFile: environment("REPORT", ".visual-diff/report.json") }],
    ["html", { open: "never", outputFolder: environment("HTML", ".visual-diff/html") }],
  ],
  retries: 0,
  snapshotPathTemplate: `${environment("SNAPSHOTS", ".visual-diff/snapshots")}/{arg}{ext}`,
  testDir: ".",
  testMatch: "stories.spec.ts",
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    deviceScaleFactor: 1,
    viewport: { height: 720, width: 1024 },
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory ${environment("STORYBOOK", "storybook-static")}`,
    reuseExistingServer: false,
    stderr: "ignore",
    url: `http://127.0.0.1:${port}/index.json`,
  },
  workers: Number(environment("WORKERS", "2")),
});
