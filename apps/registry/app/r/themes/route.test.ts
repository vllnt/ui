import { describe, expect, it } from "vitest";

import { encodeTheme } from "@/lib/theme-serialize";
import { DEFAULT_THEME, type ThemeData } from "@/lib/theme-tokens";

import { GET } from "./route";

function call(query: string): Response {
  return GET(new Request(`http://localhost/r/themes${query}`));
}

describe("GET /r/themes", () => {
  it("400 when the token is missing", () => {
    expect(call("").status).toBe(400);
  });

  it("400 for an unparseable token", () => {
    expect(call("?t=garbage!!!").status).toBe(400);
  });

  it("400 for an oversized token", () => {
    expect(call(`?t=${"a".repeat(3000)}`).status).toBe(400);
  });

  it("400 for a token carrying a CSS-injection payload", () => {
    const malicious: ThemeData = {
      ...DEFAULT_THEME,
      light: { ...DEFAULT_THEME.light, background: "0 0 0} body{x" },
    };
    expect(call(`?t=${encodeTheme(malicious)}`).status).toBe(400);
  });

  it("200 + a valid registry:theme item for a good token", async () => {
    const response = call(`?t=${encodeTheme(DEFAULT_THEME)}`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body.type).toBe("registry:theme");
    expect(body.cssVars.light.primary).toBe("oklch(0.2044 0 0)");
    expect(body.cssVars.theme["--radius"]).toBe("0.5rem");
  });

  it("honors a valid ?name and falls back for an invalid one", async () => {
    const token = encodeTheme(DEFAULT_THEME);
    const named = await call(`?t=${token}&name=my-theme`).json();
    expect(named.name).toBe("my-theme");
    const fallback = await call(`?t=${token}&name=bad name!`).json();
    expect(fallback.name).toBe("vllnt-custom");
  });
});
