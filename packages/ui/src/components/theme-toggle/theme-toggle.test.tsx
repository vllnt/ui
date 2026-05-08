import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ThemeProvider } from "../theme-provider";

import { ThemeToggle } from "./theme-toggle";

const noop = (): void => undefined;

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: noop,
      addListener: noop,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: noop,
      removeListener: noop,
    }),
    writable: true,
  });
});

const dict = {
  theme: {
    dark: "Dark",
    light: "Light",
    system: "System",
    toggle_theme: "Toggle theme",
  },
};

describe("ThemeToggle", () => {
  it("renders an accessible toggle button", () => {
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle dict={dict} />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("uses the localized aria-label", () => {
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle
          dict={{
            theme: {
              dark: "Sombre",
              light: "Clair",
              system: "Système",
              toggle_theme: "Changer le thème",
            },
          }}
        />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Changer le thème")).toBeInTheDocument();
  });
});
