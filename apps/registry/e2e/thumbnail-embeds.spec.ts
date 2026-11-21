import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

const PRODUCTION_ONLY =
  "Thumbnail asset loading is only meaningful on a production build; run with PLAYWRIGHT_BASE_URL against `next start`.";

/**
 * Stands in for the production edge: HTTPS, plus the
 * `Cross-Origin-Resource-Policy: same-site` header it sends on every response.
 * Chromium enforces that header against an opaque (sandboxed) frame only over
 * HTTPS, so plain `next start` cannot show the failure.
 */
function startEdge(target: URL): Promise<{ close: () => void; url: string }> {
  const directory = mkdtempSync(path.join(tmpdir(), "edge-"));
  const key = path.join(directory, "key.pem");
  const cert = path.join(directory, "cert.pem");
  execFileSync("openssl", [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    key,
    "-out",
    cert,
    "-days",
    "1",
    "-subj",
    "/CN=localhost",
  ]);
  const server = https.createServer(
    { cert: readFileSync(cert), key: readFileSync(key) },
    (request, response) => {
      const upstream = http.request(
        {
          headers: { ...request.headers, host: target.host },
          host: target.hostname,
          method: request.method,
          path: request.url,
          port: target.port,
        },
        (answer) => {
          response.writeHead(answer.statusCode ?? 502, {
            ...answer.headers,
            "cross-origin-resource-policy": "same-site",
          });
          answer.pipe(response);
        },
      );
      upstream.on("error", () => response.destroy());
      request.pipe(upstream);
    },
  );

  return new Promise((resolve) => {
    server.listen(0, "localhost", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        close: () => {
          server.close();
          rmSync(directory, { force: true, recursive: true });
        },
        url: `https://localhost:${port.toString()}`,
      });
    });
  });
}

test.describe("component thumbnails behind the production edge", () => {
  test("a thumbnail frame loads its stylesheets and scripts under CORP: same-site", async ({
    browser,
  }) => {
    test.skip(!process.env.PLAYWRIGHT_BASE_URL, PRODUCTION_ONLY);
    const edge = await startEdge(new URL(process.env.PLAYWRIGHT_BASE_URL ?? ""));
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const blocked: string[] = [];
    page.on("requestfailed", (request) => {
      if (request.failure()?.errorText.includes("BLOCKED_BY_RESPONSE")) {
        blocked.push(request.url());
      }
    });

    try {
      await page.goto(`${edge.url}/components`);
      const thumbnail = page.locator('iframe[src*="/embed/"]').first();
      await thumbnail.scrollIntoViewIfNeeded();
      const frame = await thumbnail.contentFrame();
      await expect(frame.locator("body")).toBeVisible();
      await page.waitForLoadState("networkidle");

      // Unstyled frames fall back to the browser's default serif font.
      const font = await frame
        .locator("body")
        .evaluate((body) => getComputedStyle(body).fontFamily);

      expect(blocked).toEqual([]);
      expect(font).not.toMatch(/Times/i);
      await expect(thumbnail).toHaveAttribute(
        "sandbox",
        "allow-scripts allow-same-origin",
      );
    } finally {
      await context.close();
      edge.close();
    }
  });
});
