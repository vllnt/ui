import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ThemeProvider } from "./theme-provider";

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

describe("ThemeProvider", () => {
  it("renders its children", () => {
    render(
      <ThemeProvider>
        <span>themed-content</span>
      </ThemeProvider>,
    );

    expect(screen.getByText("themed-content")).toBeInTheDocument();
  });

  it("forwards next-themes props", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <span>themed-content</span>
      </ThemeProvider>,
    );

    expect(screen.getByText("themed-content")).toBeInTheDocument();
  });
});
