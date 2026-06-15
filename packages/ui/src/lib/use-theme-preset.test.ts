import { beforeEach, describe, expect, it } from "vitest";

import {
  isThemePresetName,
  THEME_CUSTOM_CSS_STORAGE_KEY,
  THEME_CUSTOM_STYLE_ID,
  THEME_PRESET_STORAGE_KEY,
  THEME_PRESETS,
} from "./theme-presets";
import { setCustomTheme, setThemePreset } from "./use-theme-preset";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`)?.remove();
});

describe("isThemePresetName", () => {
  it('returns true for "matrix"', () => {
    expect(isThemePresetName("matrix")).toBe(true);
  });

  it('returns false for "nope"', () => {
    expect(isThemePresetName("nope")).toBe(false);
  });
});

describe("THEME_PRESETS", () => {
  it("has 13 entries", () => {
    expect(THEME_PRESETS).toHaveLength(13);
  });

  it('includes "default"', () => {
    expect(THEME_PRESETS.some((p) => p.name === "default")).toBe(true);
  });
});

describe("setThemePreset", () => {
  it('sets data-theme to "matrix" and persists to localStorage', () => {
    setThemePreset("matrix");

    expect(document.documentElement.dataset.theme).toBe("matrix");
    expect(localStorage.getItem(THEME_PRESET_STORAGE_KEY)).toBe("matrix");
  });

  it('removes data-theme attribute when preset is "default"', () => {
    document.documentElement.dataset.theme = "matrix";

    setThemePreset("default");

    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});

describe("setCustomTheme", () => {
  const customTheme = {
    dark: { primary: "0.6 0.1 200" },
    light: { primary: "0.5 0.1 200" },
    radius: "0.5rem",
  };

  it('sets data-theme to "custom"', () => {
    setCustomTheme(customTheme);

    expect(document.documentElement.dataset.theme).toBe("custom");
  });

  it("injects a <style> element with the correct id", () => {
    setCustomTheme(customTheme);

    const style = document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`);
    expect(style).toBeInstanceOf(HTMLStyleElement);
  });

  it('injected style contains html[data-theme="custom"]{', () => {
    setCustomTheme(customTheme);

    const style = document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`);
    expect(style?.textContent).toContain('html[data-theme="custom"]{');
  });

  it("injected style contains --primary token", () => {
    setCustomTheme(customTheme);

    const style = document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`);
    expect(style?.textContent).toContain("--primary:0.5 0.1 200");
  });

  it("injected style contains --radius token", () => {
    setCustomTheme(customTheme);

    const style = document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`);
    expect(style?.textContent).toContain("--radius:0.5rem");
  });

  it("persists custom CSS to localStorage", () => {
    setCustomTheme(customTheme);

    expect(localStorage.getItem(THEME_CUSTOM_CSS_STORAGE_KEY)).toBeTruthy();
  });

  describe("SECURITY: safeValue sanitization", () => {
    it("strips malicious } from injected primary value", () => {
      setCustomTheme({
        dark: {},
        light: { primary: "0 0 0} html{display:none" },
        radius: "0.5rem} *{}",
      });

      const content =
        document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`)?.textContent ?? "";
      expect(content).not.toContain("html{display:none");
      expect(content).not.toContain("} html");
    });
  });
});

describe("setThemePreset after setCustomTheme", () => {
  it("removes the custom <style> element and clears custom CSS from localStorage", () => {
    setCustomTheme({
      dark: { primary: "0.6 0.1 200" },
      light: { primary: "0.5 0.1 200" },
      radius: "0.5rem",
    });

    expect(document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`)).toBeTruthy();

    setThemePreset("matrix");

    expect(document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`)).toBeNull();
    expect(localStorage.getItem(THEME_CUSTOM_CSS_STORAGE_KEY)).toBeNull();
  });
});
