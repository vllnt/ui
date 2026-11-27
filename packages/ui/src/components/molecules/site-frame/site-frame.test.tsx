import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { SiteFrame, SiteThemeProvider } from "./site-frame";

beforeEach(() => {
  stubMatchMedia();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
});

describe("SiteFrame", () => {
  it("puts the skip link first, before the page content", () => {
    const { container } = render(
      <SiteFrame skipLabel="Skip to content">
        <header>Header</header>
        <main id="main">Page</main>
      </SiteFrame>,
    );
    const links = container.querySelectorAll('a[href="#main"]');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent("Skip to content");
    const first = container.querySelector("a, header, main");
    expect(first).toBe(links[0]);
  });

  it("renders its children after the skip link", () => {
    render(
      <SiteFrame skipLabel="Skip to content">
        <p>Body</p>
      </SiteFrame>,
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});

describe("SiteThemeProvider", () => {
  it("defaults to the class attribute and the system theme", () => {
    render(
      <SiteThemeProvider>
        <span>themed</span>
      </SiteThemeProvider>,
    );
    expect(screen.getByText("themed")).toBeInTheDocument();
    // stubMatchMedia reports no dark preference, so the system theme is light.
    expect(document.documentElement).toHaveClass("light");
  });

  it("lets a prop replace a default", () => {
    render(
      <SiteThemeProvider defaultTheme="dark" enableSystem={false}>
        <span>themed</span>
      </SiteThemeProvider>,
    );
    expect(document.documentElement).toHaveClass("dark");
  });
});
