import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let mockPathname = "/en/design-systems";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import { CategoryFilter } from "./category-filter";

describe("CategoryFilter", () => {
  it("renders nothing when there are no categories", () => {
    const { container } = render(<CategoryFilter categories={[]} lang="en" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("deduplicates and sorts category labels", () => {
    render(
      <CategoryFilter
        categories={["zeta", "alpha", "zeta", "design systems"]}
        lang="en"
      />,
    );

    expect(screen.getAllByText(/Alpha|Design systems|Zeta/)).toHaveLength(3);
    expect(
      screen.getAllByText(/Alpha|Design systems|Zeta/).map((node) => {
        return node.textContent;
      }),
    ).toEqual(["Alpha", "Design systems", "Zeta"]);
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

  it("renders the selected category as a non-link badge", () => {
    mockPathname = "/en/design-systems";

    render(
      <CategoryFilter
        categories={["design systems", "components"]}
        lang="en"
      />,
    );

    expect(screen.getByText("Design systems").closest("a")).toBeNull();
    expect(screen.getByText("Components").closest("a")).toHaveAttribute(
      "href",
      "/en/components",
    );
  });
});
