import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter, type SiteFooterColumn } from "./site-footer";

const COLUMNS: SiteFooterColumn[] = [
  {
    heading: "Product",
    id: "product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    heading: "Sites",
    id: "sites",
    links: [
      { external: true, href: "https://docs.example.com", label: "Docs" },
      { external: true, href: "https://blog.example.com", label: "Blog" },
    ],
  },
];

function renderFooter(
  props: Partial<React.ComponentProps<typeof SiteFooter>> = {},
) {
  return render(
    <>
      <main id="main">Page</main>
      <SiteFooter
        brand="Acme"
        columns={COLUMNS}
        navLabel="Footer"
        otherSite="other site"
        tagline="Tools for builders."
        {...props}
      />
    </>,
  );
}

describe("SiteFooter", () => {
  it("is a contentinfo landmark outside main", () => {
    const { container } = renderFooter();
    const footer = screen.getByRole("contentinfo");
    expect(container.querySelector("main")).not.toContainElement(footer);
    expect(footer.closest("main")).toBeNull();
  });

  it("shows the brand and the tagline it is given", () => {
    renderFooter();
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText("Acme")).toBeInTheDocument();
    expect(within(footer).getByText("Tools for builders.")).toBeInTheDocument();
  });

  it("holds no brand of its own: the brand is what the caller passes", () => {
    renderFooter({ brand: "Globex" });
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText("Globex")).toBeInTheDocument();
    expect(within(footer).queryByText("Acme")).toBeNull();
  });

  it("names its navigation", () => {
    renderFooter();
    expect(
      screen.getByRole("navigation", { name: "Footer" }),
    ).toBeInTheDocument();
  });

  it("gives each column an h2 title and a list it labels", () => {
    renderFooter();
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Product",
      "Sites",
    ]);
    const list = screen.getByRole("list", { name: "Product" });
    expect(within(list).getAllByRole("link")).toHaveLength(2);
    expect(headings[0]).toHaveAttribute("id", "footer-product");
  });

  it("marks an external link with an arrow and the other-site text", () => {
    renderFooter();
    const link = screen.getByRole("link", { name: /Docs/ });
    expect(link).toHaveAttribute("href", "https://docs.example.com");
    expect(link).toHaveTextContent("Docs↗ (other site)");
    expect(link.querySelector('[aria-hidden="true"]')).toHaveTextContent("↗");
    expect(link.querySelector(".sr-only")).toHaveTextContent("(other site)");
  });

  it("leaves an internal link without the other-site text", () => {
    renderFooter();
    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link).toHaveAttribute("href", "/pricing");
    expect(link).not.toHaveTextContent("other site");
  });

  it("renders the bottom row only when it is given", () => {
    const { unmount } = renderFooter();
    expect(screen.queryByText("© Acme")).toBeNull();
    unmount();
    renderFooter({ bottom: "© Acme" });
    expect(screen.getByText("© Acme")).toBeInTheDocument();
  });

  it("shares four tracks up to four columns", () => {
    renderFooter();
    const grid = screen.getByRole("navigation", { name: "Footer" });
    expect(grid).toHaveClass("md:grid-cols-4");
    expect(grid.className).not.toContain("grid-cols-5");
  });

  it("takes five tracks from 1200 px for five columns", () => {
    const five: SiteFooterColumn[] = Array.from({ length: 5 }, (_, index) => ({
      heading: `Column ${index + 1}`,
      id: `column-${index + 1}`,
      links: [{ href: `/c${index + 1}`, label: `Link ${index + 1}` }],
    }));
    renderFooter({ columns: five });
    const grid = screen.getByRole("navigation", { name: "Footer" });
    expect(grid).toHaveClass("min-[1200px]:grid-cols-5", "md:grid-cols-3");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
  });

  it.each(["glass", "solid"] as const)(
    "renders the flat footer for the %s material: no shadow, no blur",
    (material) => {
      const { container } = renderFooter({ material });
      const footer = container.querySelector("footer");
      expect(footer).toHaveAttribute("data-material", "solid");
      expect(footer?.outerHTML).not.toMatch(/shadow|blur|backdrop/);
    },
  );
});
