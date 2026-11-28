import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { requireElement } from "../../../__tests__/require-element";

import type { SiteHeaderStaticProps } from "./site-header-static";
import { SiteHeaderStatic } from "./site-header-static";

const LABELS = {
  external: "opens in a new tab",
  home: "Acme Docs home",
  menu: "Menu",
  open: "Open menu",
  primary: "Primary",
};

const NETWORK = {
  groups: [
    {
      id: "current",
      items: [
        { current: true, href: "https://docs.example.com", label: "Docs" },
      ],
    },
    {
      heading: "Products",
      id: "products",
      items: [
        { current: false, href: "https://app.example.com", label: "App" },
      ],
    },
  ],
  label: "Acme network",
};

const ITEMS = [
  { bar: "tablet", href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { external: true, href: "https://status.example.com", label: "Status" },
] as const;

function html(props: Partial<SiteHeaderStaticProps> = {}): string {
  return renderToStaticMarkup(
    <SiteHeaderStatic
      brand="Acme Docs"
      homeHref="/"
      items={ITEMS}
      labels={LABELS}
      {...props}
    />,
  );
}

function dom(props: Partial<SiteHeaderStaticProps> = {}): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html(props);
  return container;
}

describe("SiteHeaderStatic", () => {
  it("renders on the server with no hook, state or handler", () => {
    const source = readFileSync(
      join(__dirname, "site-header-static.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/["']use client["']/);
    expect(source).not.toMatch(/\buse(State|Effect|Ref|Callback|Layout)/);
    expect(html()).toContain("<header");
  });

  it("makes the title a link home when there is no network", () => {
    const link = dom().querySelector('a[aria-label="Acme Docs home"]');
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveTextContent("Acme Docs");
  });

  it("shows exactly the brand it is given", () => {
    const text = dom({ brand: "Globex" }).textContent;
    expect(text).toContain("Globex");
    expect(text).not.toContain("Acme Docs");
  });

  it("makes the title a popover button with the network list", () => {
    const document_ = dom({ network: NETWORK });
    const title = document_.querySelector("button[popovertarget=site-network]");
    expect(title).toHaveAttribute("aria-controls", "site-network");
    expect(title).not.toHaveAttribute("aria-expanded");
    expect(title?.textContent).toBe("Acme Docs, Acme network");
    const panel = document_.querySelector("nav#site-network");
    expect(panel).toHaveAttribute("popover", "auto");
    expect(panel).toHaveAttribute("aria-label", "Acme network");
  });

  it("lists the current site first, linked home and marked current", () => {
    const panel = requireElement(
      dom({ homeHref: "/en", network: NETWORK }),
      "nav#site-network",
    );
    const links = [...panel.querySelectorAll("a")];
    expect(links.map((link) => link.textContent)).toEqual(["Docs", "App"]);
    expect(links[0]).toHaveAttribute("aria-current", "true");
    expect(links[0]).toHaveAttribute("href", "/en");
    expect(links[1]).toHaveAttribute("href", "https://app.example.com");
  });

  it("never repeats the sites in the menu", () => {
    const menu = requireElement(dom({ network: NETWORK }), "#site-menu");
    expect(menu).toHaveAttribute("popover", "auto");
    expect(menu.textContent).not.toContain("Docs");
    expect(menu.textContent).not.toContain("App");
    expect(menu.textContent).toContain("Guides");
  });

  it("opens the menu from a popover button named by labels.open", () => {
    const button = dom().querySelector("button[popovertarget=site-menu]");
    expect(button).toHaveAttribute("aria-controls", "site-menu");
    expect(button?.textContent).toBe("Open menu");
  });

  it("marks the current link from currentHref and none without it", () => {
    const withPath = dom({ currentHref: "/guides" });
    expect(
      withPath.querySelector('nav[aria-label="Primary"] a[href="/guides"]'),
    ).toHaveAttribute("aria-current", "page");
    expect(dom().querySelector("[aria-current]")).toBeNull();
  });

  it("gives an external link a new tab, an arrow and the external text", () => {
    const link = dom().querySelector('#site-menu a[href^="https://status"]');
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link?.querySelector('[aria-hidden="true"]')).toHaveTextContent("↗");
    expect(link?.querySelector(".sr-only")).toHaveTextContent(
      "(opens in a new tab)",
    );
  });

  it("renders the status node beside the brand", () => {
    const document_ = dom({ status: <span>Beta</span> });
    expect(document_.textContent).toContain("Beta");
    expect(document_.querySelector("a[aria-label] span")).toBeNull();
  });

  it("has no navigation and no menu when it has nothing to list", () => {
    const document_ = dom({ items: [] });
    expect(document_.querySelector('nav[aria-label="Primary"]')).toBeNull();
    expect(document_.querySelector("#site-menu")).toBeNull();
  });

  it("is flat: no shadow, no blur", () => {
    const markup = html({ network: NETWORK });
    expect(markup).not.toMatch(/shadow|blur|backdrop|glass/);
    expect(markup).toContain('data-material="solid"');
  });
});
