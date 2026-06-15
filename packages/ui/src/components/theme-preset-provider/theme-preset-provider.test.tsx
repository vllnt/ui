import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  THEME_CUSTOM_STYLE_ID,
  THEME_PRESET_STORAGE_KEY,
} from "../../lib/theme-presets";

import { ThemePresetProvider } from "./theme-preset-provider";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`)?.remove();
});

describe("ThemePresetProvider", () => {
  it("renders its children", () => {
    render(<ThemePresetProvider>child</ThemePresetProvider>);

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders a script containing data-theme and localStorage (FOUC restore)", () => {
    const { container } = render(
      <ThemePresetProvider>content</ThemePresetProvider>,
    );

    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(script?.innerHTML).toContain("data-theme");
    expect(script?.innerHTML).toContain("localStorage");
  });

  it("seeds data-theme from defaultPreset when no stored value exists", async () => {
    render(
      <ThemePresetProvider defaultPreset="matrix">child</ThemePresetProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("matrix");
    });
  });

  it("does not override a stored preset with defaultPreset", async () => {
    localStorage.setItem(THEME_PRESET_STORAGE_KEY, "dracula");

    render(
      <ThemePresetProvider defaultPreset="matrix">child</ThemePresetProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).not.toBe("matrix");
    });
  });
});
