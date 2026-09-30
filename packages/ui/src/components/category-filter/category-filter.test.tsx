import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/design-systems",
}));

import { CategoryFilter } from "./category-filter";

describe("CategoryFilter", () => {
  it("renders nothing when there are no categories", () => {
    const { container } = render(<CategoryFilter categories={[]} lang="en" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("deduplicates and sorts labels, rendering the selected one as a non-link badge", () => {
    render(
      <CategoryFilter
        categories={["zeta", "alpha", "zeta", "design systems"]}
        lang="en"
      />,
    );
    expect(
      screen
        .getAllByText(/Alpha|Design systems|Zeta/)
        .map((node) => node.textContent),
    ).toEqual(["Alpha", "Design systems", "Zeta"]);
    expect(screen.getByText("Design systems").closest("a")).toBeNull();
    expect(screen.getByText("Alpha").closest("a")).toHaveAttribute(
      "href",
      "/en/alpha",
    );
  });

  it("slugifies category links with the active language", () => {
    render(
      <CategoryFilter categories={["Résumé Tips", "Data & AI"]} lang="fr" />,
    );
    expect(screen.getByText("Résumé Tips").closest("a")).toHaveAttribute(
      "href",
      "/fr/resume-tips",
    );
    expect(screen.getByText("Data & AI").closest("a")).toHaveAttribute(
      "href",
      "/fr/data-ai",
    );
  });
});
