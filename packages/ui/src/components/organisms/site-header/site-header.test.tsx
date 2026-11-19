import {
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SiteNetwork } from "../../molecules/network-menu-list/network-menu-list";

import { SiteHeader, type SiteHeaderProps } from "./site-header";

let mockPathname = "/packages";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/** Makes `(min-width: Npx)` match up to `width`. */
function setViewportWidth(width: number) {
  vi.stubGlobal("matchMedia", (query: string) => {
    const minimum = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0);
    return {
      addEventListener: vi.fn(),
      matches: width >= minimum,
      media: query,
      removeEventListener: vi.fn(),
    };
  });
}

const network: SiteNetwork = {
  groups: [
    {
      id: "parent",
      items: [{ current: false, href: "https://example.com", label: "vllnt" }],
    },
    {
      heading: "Learn and build",
      id: "learn-build",
      items: [
        {
          current: true,
          href: "https://oss.example.com",
          label: "Open Source",
        },
      ],
    },
  ],
  label: "vllnt network",
};

const props: SiteHeaderProps = {
  cta: { href: "/packages", label: "Browse packages" },
  homeHref: "/",
  items: [
    { bar: "tablet", href: "/packages", label: "Packages" },
    { bar: "desktop", href: "/contribute", label: "Contribute" },
    {
      bar: "desktop",
      external: true,
      href: "https://github.com/example",
      label: "GitHub",
    },
    { href: "/about", label: "About" },
  ],
  labels: {
    close: "Close menu",
    external: "opens in a new tab",
    home: "vllnt, home",
    menu: "Menu",
    open: "Open menu",
    primary: "Main",
  },
  network,
};

function menuButton() {
  return screen.getByRole("button", { name: /menu/i });
}

function menu() {
  return screen.getByRole("navigation", { hidden: true, name: "Menu" });
}

beforeEach(() => {
  mockPathname = "/packages";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SiteHeader", () => {
  it("renders a header with the brand link named by labels.home", () => {
    setViewportWidth(375);
    render(<SiteHeader {...props} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    const brand = screen.getByRole("link", { name: "vllnt, home" });
    expect(brand).toHaveAttribute("href", "/");
    expect(brand).toHaveTextContent("vllnt");
  });

  it("opens the phone menu with every link and the titled network list", () => {
    setViewportWidth(375);
    render(<SiteHeader {...props} />);

    expect(menu()).not.toBeVisible();
    fireEvent.click(menuButton());

    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    expect(menuButton()).toHaveAccessibleName("Close menu");
    const panel = menu();
    expect(panel).toBeVisible();
    expect(
      ["Packages", "Contribute", "About"].filter(
        (name) => within(panel).queryByRole("link", { name }) === null,
      ),
    ).toEqual([]);
    expect(
      within(panel).getByRole("group", { name: "vllnt network" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("link", { name: "Browse packages" }),
    ).toBeInTheDocument();
  });

  it("closes the menu on Escape and hands focus back to the button", () => {
    setViewportWidth(375);
    render(<SiteHeader {...props} />);

    fireEvent.click(menuButton());
    fireEvent.keyDown(window, { key: "Escape" });

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(menuButton()).toHaveFocus();
  });

  it("closes the menu when a menu link is followed", () => {
    setViewportWidth(375);
    render(<SiteHeader {...props} />);

    fireEvent.click(menuButton());
    const about = within(menu()).getByRole("link", { name: "About" });
    const click = createEvent.click(about);
    click.preventDefault();
    fireEvent(about, click);

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the menu on a route change", () => {
    setViewportWidth(375);
    const { rerender } = render(<SiteHeader {...props} />);

    fireEvent.click(menuButton());
    mockPathname = "/about";
    rerender(<SiteHeader {...props} />);

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the current link, and links below it, with aria-current", () => {
    mockPathname = "/packages/convex";
    setViewportWidth(375);
    render(<SiteHeader {...props} />);

    fireEvent.click(menuButton());

    expect(
      within(menu()).getByRole("link", { name: "Packages" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(menu()).getByRole("link", { name: "About" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("prefers currentHref over the browser path", () => {
    setViewportWidth(375);
    render(<SiteHeader {...props} currentHref="/about" />);

    fireEvent.click(menuButton());

    expect(within(menu()).getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens an external link in a new tab and says so to assistive tech", () => {
    setViewportWidth(375);
    render(<SiteHeader {...props} />);

    fireEvent.click(menuButton());
    const github = within(menu()).getByRole("link", { name: /GitHub/ });

    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    expect(github).toHaveAccessibleName("GitHub (opens in a new tab)");
    expect(github).not.toHaveAttribute("aria-current");
  });

  it("leaves the tablet links and the network list out of the menu from 768 px", () => {
    setViewportWidth(1024);
    render(<SiteHeader {...props} />);

    fireEvent.click(menuButton());

    expect(
      within(menu()).queryByRole("link", { name: "Packages" }),
    ).not.toBeInTheDocument();
    expect(
      within(menu()).getByRole("link", { name: "Contribute" }),
    ).toBeInTheDocument();
    expect(within(menu()).queryByRole("group")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "vllnt network" }),
    ).toBeInTheDocument();
  });

  it("never opens the menu from 1200 px, where the bar shows every link", () => {
    setViewportWidth(1440);
    render(<SiteHeader {...props} />);

    fireEvent.click(menuButton());

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("site shell standard: the current bar link is marked by weight as well as colour", () => {
    setViewportWidth(1440);
    render(<SiteHeader {...props} />);

    const bar = screen.getByRole("navigation", { name: "Main" });
    const packages = within(bar).getByRole("link", { name: "Packages" });
    expect(packages).toHaveAttribute("aria-current", "page");
    expect(packages).toHaveClass("aria-[current=page]:font-medium");
  });

  it("site shell standard: bar links keep a 44 px target and only shrink for a fine pointer from 1200 px", () => {
    setViewportWidth(1440);
    render(<SiteHeader {...props} />);

    const bar = screen.getByRole("navigation", { name: "Main" });
    expect(within(bar).getByRole("link", { name: "Packages" })).toHaveClass(
      "min-h-11",
      "min-w-11",
      "min-[1200px]:[@media(pointer:fine)]:min-h-8",
    );
    expect(screen.getByRole("link", { name: "vllnt, home" })).toHaveClass(
      "min-h-11",
    );
  });

  it("renders no switcher, locale or call to action when not given", () => {
    setViewportWidth(1440);
    render(<SiteHeader homeHref="/" items={[]} labels={props.labels} />);

    expect(
      screen.queryByRole("button", { name: "vllnt network" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Browse packages" }),
    ).not.toBeInTheDocument();
  });

  it("shows the locale link in the menu with the language's own name", () => {
    setViewportWidth(375);
    render(
      <SiteHeader
        {...props}
        locale={{
          ariaLabel: "FR, Read this page in French",
          href: "/fr",
          hrefLang: "fr",
          label: "FR",
          name: "Français",
        }}
      />,
    );

    fireEvent.click(menuButton());

    const link = within(menu()).getByRole("link", { name: "FR · Français" });
    expect(link).toHaveAttribute("lang", "fr");
    expect(link).toHaveAttribute("hrefLang", "fr");
  });
});
