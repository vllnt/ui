import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  describe("rendering", () => {
    it("renders title and description", () => {
      render(
        <EmptyState
          description="Try adjusting your search."
          title="No results"
        />,
      );

      expect(
        screen.getByRole("heading", { name: "No results" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your search."),
      ).toBeInTheDocument();
    });

    it("renders the icon as a presentational element", () => {
      render(
        <EmptyState
          icon={<svg aria-hidden="true" data-testid="icon" />}
          title="x"
        />,
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders action children", () => {
      render(
        <EmptyState title="x">
          <button type="button">Clear filters</button>
        </EmptyState>,
      );

      expect(
        screen.getByRole("button", { name: "Clear filters" }),
      ).toBeInTheDocument();
    });

    it.each(["sm", "md", "lg"] as const)("supports the %s size", (size) => {
      const { container } = render(<EmptyState size={size} title="x" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("omits sub-elements when their props are absent", () => {
      const { container } = render(<EmptyState />);

      expect(container.querySelector("h3")).not.toBeInTheDocument();
      expect(container.querySelector("p")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it('uses role="status" by default', () => {
      render(<EmptyState title="x" />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("honors a caller-provided role override", () => {
      render(
        <EmptyState role="region" title="x">
          y
        </EmptyState>,
      );

      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("renders the title as a heading", () => {
      render(<EmptyState title="No results" />);

      expect(
        screen.getByRole("heading", { level: 3, name: "No results" }),
      ).toBeInTheDocument();
    });
  });
});
