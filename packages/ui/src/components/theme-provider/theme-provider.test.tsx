import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { ThemeProvider } from "./theme-provider";

beforeEach(() => {
  stubMatchMedia();
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
