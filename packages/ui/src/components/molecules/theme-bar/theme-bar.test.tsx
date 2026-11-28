import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";
import { SiteThemeProvider } from "../site-frame/site-frame";

import { ThemeBar } from "./theme-bar";

const OPTIONS = { dark: "Dark", light: "Light", system: "System" };

function renderBar(defaultTheme = "light"): void {
  render(
    <SiteThemeProvider defaultTheme={defaultTheme} enableSystem>
      <ThemeBar label="Theme" options={OPTIONS} />
    </SiteThemeProvider>,
  );
}

beforeEach(() => {
  stubMatchMedia();
  localStorage.clear();
  document.documentElement.className = "";
});

describe("ThemeBar", () => {
  it("names the control with its caption", () => {
    renderBar();
    expect(
      screen.getByRole("radiogroup", { name: "Theme" }),
    ).toBeInTheDocument();
  });

  it("shows one choice per theme with the given text", () => {
    renderBar();
    expect(
      screen.getAllByRole("radio").map((radio) => radio.textContent),
    ).toEqual(["Light", "Dark", "System"]);
  });

  it("marks the current theme", () => {
    renderBar("dark");
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Light" })).not.toBeChecked();
  });

  it("sets the theme when a choice is picked", () => {
    renderBar("light");
    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });

  it("uses tokens only: no shadow on the chosen item", () => {
    renderBar("dark");
    const item = screen.getByRole("radio", { name: "Dark" });
    expect(item.className).toContain("data-[state=on]:shadow-none");
    expect(item.className).not.toMatch(/blur/);
  });
});
