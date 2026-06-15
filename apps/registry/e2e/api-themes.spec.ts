import { expect, test } from "@playwright/test";

import { encodeTheme } from "../lib/theme-serialize";
import { DEFAULT_THEME, type ThemeData } from "../lib/theme-tokens";

test.describe("/r/themes endpoint", () => {
  test("400 when the token is missing", async ({ request }) => {
    expect((await request.get("/r/themes")).status()).toBe(400);
  });

  test("400 for an unparseable token", async ({ request }) => {
    expect((await request.get("/r/themes?t=garbage!!!")).status()).toBe(400);
  });

  test("400 for a CSS-injection payload token", async ({ request }) => {
    const malicious: ThemeData = {
      ...DEFAULT_THEME,
      light: { ...DEFAULT_THEME.light, background: "0 0 0} body{x" },
    };
    const response = await request.get(`/r/themes?t=${encodeTheme(malicious)}`);
    expect(response.status()).toBe(400);
  });

  test("200 + a valid registry:theme for a good token", async ({ request }) => {
    const response = await request.get(
      `/r/themes?t=${encodeTheme(DEFAULT_THEME)}`,
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.type).toBe("registry:theme");
    expect(body.cssVars.light.primary).toBe("oklch(0.2044 0 0)");
  });
});
