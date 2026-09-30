import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  THEME_CUSTOM_STYLE_ID,
  THEME_PRESET_STORAGE_KEY,
  THEME_PRESETS,
} from "../../lib/theme-presets";

import { ThemeSwitcher } from "./theme-switcher";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`)?.remove();
});

describe("ThemeSwitcher", () => {
  it('renders a radiogroup "Theme preset" with one radio per preset', () => {
    render(<ThemeSwitcher />);
    expect(
      screen.getByRole("radiogroup", { name: "Theme preset" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(THEME_PRESETS.length);
  });

  it.each(THEME_PRESETS.map((p) => [p.label]))(
    "radio with label %s is in the document",
    (label) => {
      render(<ThemeSwitcher />);

      expect(screen.getByRole("radio", { name: label })).toBeInTheDocument();
    },
  );

  it('clicking "Matrix" swatch sets data-theme to "matrix"', () => {
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole("radio", { name: "Matrix" }));
    expect(document.documentElement.dataset.theme).toBe("matrix");
  });

  it("clicking a swatch persists the preset to localStorage", () => {
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole("radio", { name: "Dracula" }));
    expect(localStorage.getItem(THEME_PRESET_STORAGE_KEY)).toBe("dracula");
  });
});
