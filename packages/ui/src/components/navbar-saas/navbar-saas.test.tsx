import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "../sidebar-provider";

import { NavbarSaas, type NavbarSaasProps } from "./navbar-saas";

let mockPathname = "/docs";

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

vi.mock("../theme-toggle/theme-toggle", () => ({
  ThemeToggle: () => (
    <button aria-label="Toggle theme" type="button">
      Theme
    </button>
  ),
}));

const navItems = [
  { href: "/", title: "Home" },
  { href: "/docs", title: "Docs" },
  { href: "/blog", title: "Blog" },
];

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
    writable: true,
  });
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function renderNavbar(props: Partial<NavbarSaasProps> = {}) {
  return render(
    <SidebarProvider>
      <NavbarSaas
        brand="Vllnt"
        navItems={navItems}
        rightSlot={<a href="/login">Login</a>}
        {...props}
      />
    </SidebarProvider>,
  );
}

describe("NavbarSaas", () => {
  beforeEach(() => {
    mockPathname = "/docs";
    setViewportWidth(1280);
  });

  it("renders brand, navigation links, right slot, and theme toggle", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "Vllnt" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "/docs",
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("marks the current pathname as active", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "Docs" })).toHaveClass(
      "text-foreground",
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass(
      "text-foreground/60",
    );
  });

  it("matches active navigation when hrefs carry query state", () => {
    renderNavbar({
      navItems: [
        { href: "/?platform=native", title: "Home" },
        { href: "/docs?platform=native&ref=test", title: "Docs" },
      ],
    });

    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders a custom React node brand", () => {
    renderNavbar({
      brand: <a href="/custom">Custom Brand</a>,
      rightSlot: undefined,
    });

    expect(screen.getByRole("link", { name: "Custom Brand" })).toHaveAttribute(
      "href",
      "/custom",
    );
  });

  it("toggles the mobile menu icon when the trigger is clicked", async () => {
    setViewportWidth(390);
    const { container } = renderNavbar();

    await waitFor(() => {
      expect(container.querySelector(".lucide-menu")).toBeInTheDocument();
    });

    const trigger = screen.getByTestId("navbar-saas-mobile-trigger");
    expect(trigger).not.toHaveAttribute("aria-controls");
    expect(trigger).toHaveAttribute("aria-label", "Open sidebar");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-label", "Close sidebar");
    expect(container.querySelector(".lucide-x")).toBeInTheDocument();
  });

  it("does not render the mobile trigger when mobile menu is disabled", async () => {
    setViewportWidth(390);
    const { container } = renderNavbar({ showMobileMenu: false });

    await waitFor(() => {
      expect(container.querySelector(".lucide-menu")).not.toBeInTheDocument();
    });
  });

  it("renders the sidebar toggle on desktop and toggles its icon", () => {
    setViewportWidth(1280);
    const { container } = renderNavbar();

    const trigger = screen.getByTestId("navbar-saas-mobile-trigger");
    expect(trigger).toHaveAttribute("aria-label", "Open sidebar");
    expect(
      container.querySelector(".lucide-panel-left-open"),
    ).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-label", "Close sidebar");
    expect(
      container.querySelector(".lucide-panel-left-close"),
    ).toBeInTheDocument();
  });

  it("supports localized sidebar labels and a custom controlled id", () => {
    renderNavbar({
      closeSidebarLabel: "Fermer la navigation",
      openSidebarLabel: "Ouvrir la navigation",
      sidebarId: "documentation-sidebar",
    });

    const trigger = screen.getByRole("button", {
      name: "Ouvrir la navigation",
    });
    expect(trigger).toHaveAttribute("aria-controls", "documentation-sidebar");

    fireEvent.click(trigger);

    expect(trigger).toHaveAccessibleName("Fermer la navigation");
  });
});
