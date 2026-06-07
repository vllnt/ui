import { describe, expect, it } from "vitest";

import {
  decodeTheme,
  encodeTheme,
  themeInstallUrl,
  themeToCss,
  themeToRegistryItem,
  themeToTokensJson,
} from "@/lib/theme-serialize";
import { DEFAULT_THEME, type ThemeData } from "@/lib/theme-tokens";

describe("theme-serialize encode/decode", () => {
  it("round-trips the default theme", () => {
    const decoded = decodeTheme(encodeTheme(DEFAULT_THEME));
    expect(decoded).toBeDefined();
    expect(decoded?.light.primary).toBe(DEFAULT_THEME.light.primary);
    expect(decoded?.dark.background).toBe(DEFAULT_THEME.dark.background);
    expect(decoded?.radius).toBe(DEFAULT_THEME.radius);
  });

  it("produces a URL-safe token", () => {
    expect(encodeTheme(DEFAULT_THEME)).not.toMatch(/[+/=]/);
  });

  it("returns undefined for malformed tokens", () => {
    expect(decodeTheme("")).toBeUndefined();
    expect(decodeTheme("not-base64!!!")).toBeUndefined();
  });
});

describe("theme-serialize security", () => {
  it("rejects a token whose channel value carries a CSS-injection payload", () => {
    const malicious: ThemeData = {
      ...DEFAULT_THEME,
      light: { ...DEFAULT_THEME.light, background: "0 0 0} html{display:none" },
    };
    expect(decodeTheme(encodeTheme(malicious))).toBeUndefined();
  });

  it("rejects a token whose radius carries a CSS-injection payload", () => {
    const malicious: ThemeData = { ...DEFAULT_THEME, radius: "0.5rem} *{}" };
    expect(decodeTheme(encodeTheme(malicious))).toBeUndefined();
  });

  it("rejects non-numeric channel content", () => {
    const malicious: ThemeData = {
      ...DEFAULT_THEME,
      dark: { ...DEFAULT_THEME.dark, primary: "url(https://evil)" },
    };
    expect(decodeTheme(encodeTheme(malicious))).toBeUndefined();
  });
});

describe("theme-serialize exports", () => {
  it("renders a CSS :root/.dark block with oklch() values", () => {
    const css = themeToCss(DEFAULT_THEME);
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
    expect(css).toContain("--primary: oklch(0.2044 0 0)");
    expect(css).toContain("--radius: 0.5rem");
  });

  it("renders the canonical tokens.json shape", () => {
    const json = themeToTokensJson(DEFAULT_THEME) as {
      color: { format: string };
      radius: string;
    };
    expect(json.color.format).toBe("oklch-channel");
    expect(json.radius).toBe("0.5rem");
  });

  it("renders a shadcn registry:theme item", () => {
    const item = themeToRegistryItem(DEFAULT_THEME, "demo") as {
      cssVars: { light: Record<string, string>; theme: Record<string, string> };
      name: string;
      type: string;
    };
    expect(item.type).toBe("registry:theme");
    expect(item.name).toBe("demo");
    expect(item.cssVars.light.primary).toBe("oklch(0.2044 0 0)");
    expect(item.cssVars.theme["--radius"]).toBe("0.5rem");
  });

  it("builds an install URL pointing at /r/themes", () => {
    const url = themeInstallUrl("https://ui.vllnt.ai", DEFAULT_THEME, "demo");
    expect(url.startsWith("https://ui.vllnt.ai/r/themes?t=")).toBe(true);
    expect(url).toContain("name=demo");
  });
});
