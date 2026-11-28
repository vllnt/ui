import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";
import { SiteFooter } from "../../molecules/site-footer/site-footer";
import { SiteHeader } from "../../organisms/site-header/site-header";

import { SiteShell, type SiteShellProps } from "./site-shell";

const SETTINGS = {
  theme: {
    label: "Theme",
    options: { dark: "Dark", light: "Light", system: "System" },
  },
};

function renderShell(props: Partial<SiteShellProps> = {}) {
  return render(
    <SiteShell
      footer={
        <SiteFooter
          brand="Acme"
          columns={[
            {
              heading: "Product",
              id: "product",
              links: [{ href: "/pricing", label: "Pricing" }],
            },
            {
              heading: "Sites",
              id: "sites",
              links: [
                {
                  external: true,
                  href: "https://docs.example.com",
                  label: "Docs",
                },
              ],
            },
          ]}
          navLabel="Footer"
          otherSite="other site"
          tagline="Tools for builders."
        />
      }
      header={
        <SiteHeader
          brand="Acme"
          homeHref="/"
          items={[{ bar: "tablet", href: "/docs", label: "Docs" }]}
          labels={{
            close: "Close menu",
            home: "Acme home",
            menu: "Menu",
            open: "Open menu",
            primary: "Primary",
          }}
        />
      }
      skipLabel="Skip to content"
      {...props}
    >
      <p>Page text</p>
    </SiteShell>,
  );
}

beforeEach(() => {
  stubMatchMedia(false);
  document.documentElement.className = "";
});

describe("SiteShell landmarks", () => {
  it("has one skip link to #main, before every other focusable element", () => {
    const { container } = renderShell();
    const skips = container.querySelectorAll('a[href="#main"]');
    expect(skips).toHaveLength(1);
    expect(skips[0]).toHaveTextContent("Skip to content");
    expect(container.querySelector("a, button")).toBe(skips[0]);
  });

  it("has one main#main holding the page", () => {
    const { container } = renderShell();
    expect(container.querySelectorAll("main#main")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveTextContent("Page text");
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("has a banner with a labelled navigation before main", () => {
    renderShell();
    const header = screen.getByRole("banner");
    expect(
      within(header).getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(
      header.compareDocumentPosition(screen.getByRole("main")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("puts the footer after main and outside it", () => {
    renderShell();
    const footer = screen.getByRole("contentinfo");
    const main = screen.getByRole("main");
    expect(main).not.toContainElement(footer);
    expect(
      main.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("gives the footer column titles an h2", () => {
    renderShell();
    const footer = screen.getByRole("contentinfo");
    expect(
      within(footer)
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["Product", "Sites"]);
  });

  it("marks an external footer link for assistive tech", () => {
    renderShell();
    expect(
      within(screen.getByRole("contentinfo")).getByRole("link", {
        name: /^Docs\s*\(other site\)$/,
      }),
    ).toHaveAttribute("href", "https://docs.example.com");
  });

  it("passes mainClassName to the main element", () => {
    renderShell({ mainClassName: "flex-1" });
    expect(screen.getByRole("main")).toHaveClass("flex-1");
  });
});

describe("SiteShell settings", () => {
  it("renders no theme control without settings", () => {
    renderShell();
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });

  it("renders the theme bar after the footer when settings give a theme", () => {
    renderShell({ settings: SETTINGS });
    const group = screen.getByRole("radiogroup", { name: "Theme" });
    expect(
      screen.getByRole("contentinfo").compareDocumentPosition(group) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });
});

describe("SiteShell theme provider", () => {
  it("sets the system theme class on the document", () => {
    renderShell();
    expect(document.documentElement).toHaveClass("light");
  });
});
