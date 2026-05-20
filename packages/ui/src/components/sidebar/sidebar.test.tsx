import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SidebarProvider, useSidebar } from "../sidebar-provider";

import { Sidebar, type SidebarSection } from "./sidebar";

let mockPathname = "/docs/components";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

const sections: SidebarSection[] = [
  {
    items: [
      { href: "/", title: "Overview" },
      { href: "/docs/components", title: "Components" },
    ],
  },
  {
    items: [
      { href: "/docs/forms", title: "Forms" },
      { href: "/docs/navigation", title: "Navigation" },
    ],
    title: "Guides",
  },
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

function SidebarStateProbe() {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <span data-testid="sidebar-state">{open ? "open" : "closed"}</span>
      <button
        onClick={() => {
          setOpen(true);
        }}
        type="button"
      >
        Open sidebar
      </button>
    </>
  );
}

function renderSidebar(sidebarSections: SidebarSection[] = sections) {
  return render(
    <SidebarProvider>
      <Sidebar sections={sidebarSections} />
      <SidebarStateProbe />
    </SidebarProvider>,
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    mockPathname = "/docs/components";
    setViewportWidth(1280);
  });

  it("renders sections, links, and active route state", async () => {
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("open");
    });

    expect(screen.getByText("Guides")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Components" })).toHaveClass(
      "bg-accent",
      "text-accent-foreground",
    );
    expect(screen.getByRole("link", { name: "Forms" })).toHaveAttribute(
      "href",
      "/docs/forms",
    );
  });

  it("honors collapsible section default state and toggles it", () => {
    renderSidebar([
      {
        collapsible: true,
        defaultOpen: false,
        items: [{ href: "/docs/forms", title: "Forms" }],
        title: "Guides",
      },
    ]);

    const trigger = screen.getByRole("button", { name: "Guides" });
    const panel = trigger.nextElementSibling;

    expect(panel).toHaveAttribute("hidden");
    expect(
      screen.queryByRole("link", { name: "Forms" }),
    ).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(panel).not.toHaveAttribute("hidden");
    expect(screen.getByRole("link", { name: "Forms" })).toHaveAttribute(
      "href",
      "/docs/forms",
    );
  });

  it("opens on desktop and closes on mobile resize", async () => {
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("open");
    });

    setViewportWidth(390);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("closed");
    });

    setViewportWidth(1280);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("open");
    });
  });

  it("closes the mobile overlay on click", async () => {
    setViewportWidth(390);
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("closed");
    });

    fireEvent.click(screen.getByRole("button", { name: "Open sidebar" }));

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("open");
    });

    const overlay = screen.getByTestId("sidebar-overlay");

    fireEvent.click(overlay);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("closed");
    });
  });

  it("closes the mobile sidebar when a link is selected", async () => {
    setViewportWidth(390);
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("closed");
    });

    fireEvent.click(screen.getByRole("button", { name: "Open sidebar" }));
    fireEvent.click(screen.getByRole("link", { name: "Forms" }));

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("closed");
    });
  });
});
