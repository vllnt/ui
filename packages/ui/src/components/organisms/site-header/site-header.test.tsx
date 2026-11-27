import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireElement } from "../../../__tests__/require-element";
import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import type { SiteHeaderProps } from "./nav-parts";
import { SiteHeader } from "./site-header";

const LABELS = {
  close: "Close menu",
  external: "opens in a new tab",
  home: "Acme home",
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
      id: "parent",
      items: [{ current: false, href: "https://example.com", label: "Acme" }],
    },
    {
      heading: "Products",
      id: "products",
      items: [
        { current: false, href: "https://app.example.com", label: "App" },
        { current: false, href: "https://blog.example.com", label: "Blog" },
      ],
    },
  ],
  label: "Acme network",
};

const ITEMS = [
  { bar: "tablet", href: "/guides", label: "Guides" },
  { bar: "desktop", href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { external: true, href: "https://status.example.com", label: "Status" },
] as const;

function renderHeader(props: Partial<SiteHeaderProps> = {}) {
  return render(
    <SiteHeader
      brand="Acme Docs"
      homeHref="/"
      items={ITEMS}
      labels={LABELS}
      {...props}
    />,
  );
}

beforeEach(() => {
  stubMatchMedia(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SiteHeader landmarks", () => {
  it("is a banner with a labelled primary navigation", () => {
    renderHeader();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("shows exactly the brand it is given: it has no default brand", () => {
    renderHeader({ brand: "Globex" });
    const header = screen.getByRole("banner");
    expect(within(header).getByText("Globex")).toBeInTheDocument();
    expect(within(header).queryByText("Acme Docs")).toBeNull();
  });

  it("is flat: no shadow, no blur, a hairline under the bar", () => {
    renderHeader({ network: NETWORK });
    const header = screen.getByRole("banner");
    expect(header.outerHTML).not.toMatch(/shadow|blur|backdrop|glass/);
    expect(header).toHaveClass("border-b", "border-border", "bg-background");
    expect(header).toHaveAttribute("data-material", "solid");
  });

  it("renders the same flat header for both materials", () => {
    const { rerender } = renderHeader({ material: "glass" });
    const glass = screen.getByRole("banner").className;
    rerender(
      <SiteHeader
        brand="Acme Docs"
        homeHref="/"
        items={ITEMS}
        labels={LABELS}
        material="solid"
      />,
    );
    expect(screen.getByRole("banner").className).toBe(glass);
  });
});

describe("SiteHeader without a network", () => {
  it("makes the title a link home named by labels.home", () => {
    renderHeader();
    const home = screen.getByRole("link", { name: "Acme home" });
    expect(home).toHaveAttribute("href", "/");
    expect(home).toHaveTextContent("Acme Docs");
    expect(screen.queryByRole("button", { name: /Acme network/ })).toBeNull();
  });
});

describe("SiteHeader with a network: the title is the switcher", () => {
  it("makes the title a button named by the title and the network label", () => {
    renderHeader({ network: NETWORK });
    const title = screen.getByRole("button", {
      name: "Acme Docs, Acme network",
    });
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(title).toHaveAttribute("aria-controls", "site-network");
    expect(title).not.toHaveAttribute("aria-haspopup");
    expect(screen.queryByRole("link", { name: "Acme home" })).toBeNull();
  });

  it("keeps the links in the page while the panel is shut", () => {
    renderHeader({ network: NETWORK });
    const panel = document.querySelector("#site-network");
    expect(panel?.tagName).toBe("NAV");
    expect(panel).toHaveAttribute("hidden");
    expect(panel?.querySelectorAll("a[href]")).toHaveLength(4);
  });

  it("lists the current site first, linked home and marked current", () => {
    renderHeader({ homeHref: "/en", network: NETWORK });
    const panel = requireElement(document, "#site-network");
    const links = [...panel.querySelectorAll("a")];
    expect(links.map((link) => link.textContent)).toEqual([
      "Docs",
      "Acme",
      "App",
      "Blog",
    ]);
    expect(links[0]).toHaveAttribute("aria-current", "true");
    expect(links[0]).toHaveAttribute("href", "/en");
    expect(panel.querySelectorAll("[aria-current]")).toHaveLength(1);
    expect(links[1]).toHaveAttribute("href", "https://example.com");
    expect(links[1]).not.toHaveAttribute("rel");
  });

  it("labels each group list with its heading", () => {
    renderHeader({ network: NETWORK });
    const panel = requireElement(document, "#site-network");
    const lists = within(panel).getAllByRole("list", { hidden: true });
    expect(lists).toHaveLength(3);
    expect(
      within(panel).getByRole("list", { hidden: true, name: "Products" }),
    ).toBeInTheDocument();
  });

  it("opens on click and shuts on a second click", () => {
    renderHeader({ network: NETWORK });
    const title = screen.getByRole("button", { name: /Acme network/ });
    fireEvent.click(title);
    expect(title).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("#site-network")).not.toHaveAttribute(
      "hidden",
    );
    fireEvent.click(title);
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("#site-network")).toHaveAttribute("hidden");
  });

  it("closes on Escape and hands focus back to the title", () => {
    renderHeader({ network: NETWORK });
    const title = screen.getByRole("button", { name: /Acme network/ });
    fireEvent.click(title);
    screen.getByRole("link", { name: "App" }).focus();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(title).toHaveFocus();
  });

  it("closes on a press outside the title and the panel", () => {
    renderHeader({ network: NETWORK });
    const title = screen.getByRole("button", { name: /Acme network/ });
    fireEvent.click(title);
    fireEvent.pointerDown(document.body);
    expect(title).toHaveAttribute("aria-expanded", "false");
  });

  it("stays open on a press inside the panel", () => {
    renderHeader({ network: NETWORK });
    const title = screen.getByRole("button", { name: /Acme network/ });
    fireEvent.click(title);
    fireEvent.pointerDown(screen.getByRole("link", { name: "App" }));
    expect(title).toHaveAttribute("aria-expanded", "true");
  });

  it("opens at the first link on Arrow Down and moves with the arrows", () => {
    renderHeader({ network: NETWORK });
    const title = screen.getByRole("button", { name: /Acme network/ });
    title.focus();
    fireEvent.keyDown(title, { key: "ArrowDown" });
    expect(title).toHaveAttribute("aria-expanded", "true");
    const first = screen.getByRole("link", { name: "Docs" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(screen.getByRole("link", { name: "Acme" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("link", { name: "Acme" }), {
      key: "End",
    });
    expect(screen.getByRole("link", { name: "Blog" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("link", { name: "Blog" }), {
      key: "Home",
    });
    expect(first).toHaveFocus();
  });

  it("closes when focus leaves the title and the panel", () => {
    renderHeader({ network: NETWORK });
    const title = screen.getByRole("button", { name: /Acme network/ });
    fireEvent.click(title);
    const outside = document.createElement("button");
    document.body.append(outside);
    fireEvent.blur(title, { relatedTarget: outside });
    expect(title).toHaveAttribute("aria-expanded", "false");
    outside.remove();
  });

  it("never repeats the sites in the menu", () => {
    renderHeader({ network: NETWORK });
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("navigation", { name: "Menu" });
    const repeated = ["Docs", "Acme", "App", "Blog"].filter((site) =>
      within(menu).queryByRole("link", { name: site }),
    );
    expect(repeated).toEqual([]);
    expect(
      within(menu).getByRole("link", { name: "Guides" }),
    ).toBeInTheDocument();
  });

  it("closes the panel when the page changes", () => {
    const { rerender } = renderHeader({ currentHref: "/a", network: NETWORK });
    const title = screen.getByRole("button", { name: /Acme network/ });
    fireEvent.click(title);
    rerender(
      <SiteHeader
        brand="Acme Docs"
        currentHref="/b"
        homeHref="/"
        items={ITEMS}
        labels={LABELS}
        network={NETWORK}
      />,
    );
    expect(title).toHaveAttribute("aria-expanded", "false");
  });
});

describe("SiteHeader links and menu", () => {
  it("marks the link of the current page, and the pages below it", () => {
    renderHeader({ currentHref: "/guides/start" });
    const bar = screen.getByRole("navigation", { name: "Primary" });
    expect(within(bar).getByRole("link", { name: "Guides" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(bar).getByRole("link", { name: "Pricing" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("gives an external link a new tab, an arrow and the external text", () => {
    renderHeader({ currentHref: "/" });
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const link = screen.getByRole("link", { name: /Status/ });
    expect(link).toHaveAttribute("href", "https://status.example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.querySelector('[aria-hidden="true"]')).toHaveTextContent("↗");
    expect(link.querySelector(".sr-only")).toHaveTextContent(
      "(opens in a new tab)",
    );
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("opens and closes the menu from its button, which names its state", () => {
    renderHeader();
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-controls", "site-menu");
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    const close = screen.getByRole("button", { name: "Close menu" });
    expect(close).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("navigation", { name: "Menu" }),
    ).toBeInTheDocument();
    fireEvent.click(close);
    expect(screen.queryByRole("navigation", { name: "Menu" })).toBeNull();
  });

  it("closes the menu on Escape and returns focus to its button", () => {
    renderHeader();
    const button = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(button);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });

  it("has no menu button when the menu would list nothing", () => {
    renderHeader({ items: [] });
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
  });

  it("leaves the tablet links out of the menu from 768 px", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query.includes("768"),
        media: query,
        removeEventListener: vi.fn(),
      })),
    );
    renderHeader({ items: [ITEMS[0], ITEMS[2]] });
    // From 768 px the bar shows the `tablet` link, so the menu lists the rest.
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("navigation", { name: "Menu" });
    expect(
      within(menu).getByRole("link", { name: "About" }),
    ).toBeInTheDocument();
    expect(within(menu).queryByRole("link", { name: "Guides" })).toBeNull();
  });

  it("shows the language link and the button", () => {
    renderHeader({
      cta: { href: "/start", label: "Get started" },
      locale: {
        ariaLabel: "FR, Read this page in French",
        href: "/fr",
        hrefLang: "fr",
        label: "FR",
        name: "Français",
      },
    });
    const bar = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(bar).getByRole("link", { name: "FR, Read this page in French" }),
    ).toHaveAttribute("hreflang", "fr");
    expect(
      within(bar).getByRole("link", { name: "Get started" }),
    ).toHaveAttribute("href", "/start");
  });
});

describe("SiteHeader actions slot", () => {
  it("renders nothing for the slot without actions", () => {
    renderHeader();
    expect(screen.queryByRole("search")).toBeNull();
  });

  it("renders actions in the primary navigation, before the menu button", () => {
    renderHeader({ actions: <button type="button">Search</button> });
    const bar = screen.getByRole("navigation", { name: "Primary" });
    const search = within(bar).getByRole("button", { name: "Search" });
    const menu = within(bar).getByRole("button", { name: "Open menu" });
    expect(
      search.compareDocumentPosition(menu) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
