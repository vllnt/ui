import { createRef, type ReactElement, type ReactNode } from "react";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const sample: BreadcrumbItem[] = [
  { href: "/", label: "Home" },
  { href: "/runs", label: "Runs" },
  { label: "research-2025" },
];

describe("Breadcrumb", () => {
  it("renders a landmark with links for href items and a plain last item", () => {
    const { container } = render(<Breadcrumb items={sample} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Runs")).toBeInTheDocument();
    expect(screen.getByText("research-2025")).toBeInTheDocument();
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Runs").closest("a")).toHaveAttribute(
      "href",
      "/runs",
    );
    expect(screen.getByText("research-2025").closest("a")).toBeNull();
    expect(container.querySelector("nav")).toHaveAttribute(
      "aria-label",
      "Breadcrumb",
    );
  });

  it("respects the separator prop", () => {
    render(<Breadcrumb items={sample} separator="slash" />);
    expect(screen.getAllByText("/").length).toBeGreaterThan(0);
  });
});

const trail: BreadcrumbItem[] = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/ui", label: "UI" },
  { href: "/docs/ui/atoms", label: "Atoms" },
  { label: "Breadcrumb" },
];

describe("Breadcrumb accessible name", () => {
  it("names the navigation landmark Breadcrumb by default", () => {
    render(<Breadcrumb items={sample} />);
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });

  it("uses labels.region as the landmark name", () => {
    render(<Breadcrumb items={sample} labels={{ region: "Fil d'Ariane" }} />);
    expect(
      screen.getByRole("navigation", { name: "Fil d'Ariane" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
  });

  it("falls back to the default name when labels omit region", () => {
    render(<Breadcrumb items={sample} labels={{ more: "Plus" }} />);
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });
});

describe("Breadcrumb current page", () => {
  it("marks only the last item with aria-current=page and renders it as text", () => {
    const { container } = render(<Breadcrumb items={sample} />);
    const current = screen.getByText("research-2025").closest("[aria-current]");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current?.closest("a")).toBeNull();
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  it("links every earlier item", () => {
    render(<Breadcrumb items={sample} />);
    expect(
      screen.getAllByRole("link").map((a) => a.getAttribute("href")),
    ).toEqual(["/", "/runs"]);
    expect(screen.getByText("Home").closest("a")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders the last item as text even when it has an href", () => {
    render(
      <Breadcrumb
        items={[
          { href: "/", label: "Home" },
          { href: "/runs", label: "Runs" },
        ]}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("Runs").closest("[aria-current]")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders an earlier item without href as text without aria-current", () => {
    const { container } = render(
      <Breadcrumb items={[{ label: "Section" }, { label: "Page" }]} />,
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  it("uses the foreground role for the current crumb and muted for the rest", () => {
    render(<Breadcrumb items={sample} />);
    const current = screen.getByText("research-2025").closest("[aria-current]");
    expect(current).toHaveClass("text-foreground", "font-medium");
    expect(current).not.toHaveClass("text-muted-foreground");
    expect(screen.getByText("Home").closest("a")).toHaveClass(
      "text-muted-foreground",
    );
    expect(screen.getByText("Runs").closest("a")).toHaveClass(
      "text-muted-foreground",
    );
  });

  it("keeps every crumb muted in the minimal variant", () => {
    render(<Breadcrumb items={sample} variant="minimal" />);
    const current = screen.getByText("research-2025").closest("[aria-current]");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("text-muted-foreground");
    expect(current).not.toHaveClass("text-foreground");
  });
});

describe("Breadcrumb structure", () => {
  it("renders an ordered list with one list item per crumb", () => {
    render(<Breadcrumb items={sample} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(list.closest("nav")).not.toBeNull();
  });

  it("hides every separator from assistive technology", () => {
    const { container } = render(<Breadcrumb items={sample} />);
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
    separators.forEach((separator) => {
      expect(separator).toHaveTextContent("›");
    });
  });

  it("renders an empty list for an empty trail", () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("renders a single item as the current page", () => {
    render(<Breadcrumb items={[{ label: "Only" }]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Only").closest("[aria-current]")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("forwards ref to the nav element", () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb items={sample} ref={ref} />);
    expect(ref.current?.tagName).toBe("NAV");
  });
});

describe("Breadcrumb linkComponent", () => {
  const seen: { className?: string; href: string }[] = [];
  const RecordingLink = ({
    children,
    className,
    href,
  }: {
    children: ReactNode;
    className?: string;
    href: string;
  }): ReactElement => {
    seen.push({ className, href });
    return (
      <a className={className} data-custom-link="" href={href}>
        {children}
      </a>
    );
  };

  it("renders every linked crumb through the custom component with its href", () => {
    seen.length = 0;
    const { container } = render(
      <Breadcrumb items={sample} linkComponent={RecordingLink} />,
    );
    expect(seen.map((call) => call.href)).toEqual(["/", "/runs"]);
    expect(container.querySelectorAll("[data-custom-link]")).toHaveLength(2);
    expect(seen[0]?.className).toContain("text-muted-foreground");
  });

  it("does not route the current page through the custom component", () => {
    seen.length = 0;
    render(<Breadcrumb items={sample} linkComponent={RecordingLink} />);
    expect(seen.map((call) => call.href)).not.toContain("/runs/research-2025");
    expect(screen.getByText("research-2025").closest("a")).toBeNull();
  });

  it("does not call the custom component when no crumb has an href", () => {
    seen.length = 0;
    render(
      <Breadcrumb
        items={[{ label: "A" }, { label: "B" }]}
        linkComponent={RecordingLink}
      />,
    );
    expect(seen).toHaveLength(0);
  });
});

describe("Breadcrumb overflow", () => {
  it("renders every crumb by default", () => {
    render(<Breadcrumb items={trail} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.queryByText("More")).toBeNull();
  });

  it("collapses five items to three crumbs plus the ellipsis", () => {
    render(<Breadcrumb items={trail} overflow="collapsed" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Atoms")).toBeInTheDocument();
    expect(screen.getByText("Breadcrumb")).toBeInTheDocument();
    expect(screen.queryByText("Docs")).toBeNull();
    expect(screen.queryByText("UI")).toBeNull();
  });

  it("puts the ellipsis second and hides it from assistive technology", () => {
    render(<Breadcrumb items={trail} overflow="collapsed" />);
    const word = screen.getByText("More");
    expect(word).toHaveClass("sr-only");
    expect(word.closest("li")).toBe(screen.getAllByRole("listitem")[1]);
    expect(screen.getByText("…")).toHaveAttribute("aria-hidden", "true");
  });

  it("localizes the sr-only word with labels.more", () => {
    render(
      <Breadcrumb
        items={trail}
        labels={{ more: "Plus" }}
        overflow="collapsed"
      />,
    );
    expect(screen.getByText("Plus")).toHaveClass("sr-only");
    expect(screen.queryByText("More")).toBeNull();
  });

  it("keeps aria-current on the last crumb after collapsing", () => {
    const { container } = render(
      <Breadcrumb items={trail} overflow="collapsed" />,
    );
    expect(
      screen.getByText("Breadcrumb").closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "page");
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  it("collapses four items to the first, the ellipsis and the last two", () => {
    render(<Breadcrumb items={trail.slice(0, 4)} overflow="collapsed" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.queryByText("Docs")).toBeNull();
    expect(screen.getByText("UI")).toBeInTheDocument();
  });

  it("leaves a trail of three or fewer untouched", () => {
    render(<Breadcrumb items={sample} overflow="collapsed" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByText("More")).toBeNull();
  });

  it("handles an empty trail when collapsed", () => {
    render(<Breadcrumb items={[]} overflow="collapsed" />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("Breadcrumb keys", () => {
  it("renders repeated labels without duplicate-key errors", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => null);
    render(
      <Breadcrumb
        items={[
          { href: "/a", label: "Docs" },
          { href: "/a/b", label: "Docs" },
          { label: "Page" },
        ]}
      />,
    );
    expect(screen.getAllByText("Docs")).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
