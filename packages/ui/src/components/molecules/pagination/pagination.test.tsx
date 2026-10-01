import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Pagination className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is a labelled nav whose pages are single links without nested buttons", () => {
    render(<Pagination baseUrl="/blog" currentPage={3} totalPages={10} />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav.querySelector("a button, button a")).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/blog?page=2",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/blog?page=4",
    );
  });

  it("marks only the current page with aria-current", () => {
    render(<Pagination baseUrl="/blog" currentPage={3} totalPages={10} />);
    expect(screen.getByRole("link", { name: "3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "4" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
