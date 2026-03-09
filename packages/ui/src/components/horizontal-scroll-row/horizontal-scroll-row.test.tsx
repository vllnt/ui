import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HorizontalScrollRow } from "./horizontal-scroll-row";

describe("HorizontalScrollRow", () => {
  describe("rendering", () => {
    it("renders title", () => {
      render(
        <HorizontalScrollRow title="Design">
          <div>Card 1</div>
        </HorizontalScrollRow>,
      );
      expect(screen.getByText("Design")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <HorizontalScrollRow description="Optional text" title="Design">
          <div>Card 1</div>
        </HorizontalScrollRow>,
      );
      expect(screen.getByText("Optional text")).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      render(
        <HorizontalScrollRow title="Design">
          <div>Card 1</div>
        </HorizontalScrollRow>,
      );
      expect(screen.queryByText("Optional text")).not.toBeInTheDocument();
    });

    it("renders children", () => {
      render(
        <HorizontalScrollRow title="Row">
          <div>Card A</div>
          <div>Card B</div>
        </HorizontalScrollRow>,
      );
      expect(screen.getByText("Card A")).toBeInTheDocument();
      expect(screen.getByText("Card B")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <HorizontalScrollRow className="custom-class" title="Row">
          <div>Card</div>
        </HorizontalScrollRow>,
      );
      const section = screen.getByText("Row").closest("section");
      expect(section).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("renders as a section element", () => {
      render(
        <HorizontalScrollRow title="Row">
          <div>Card</div>
        </HorizontalScrollRow>,
      );
      const section = screen.getByText("Row").closest("section");
      expect(section).toBeInTheDocument();
    });

    it("uses heading element for title", () => {
      render(
        <HorizontalScrollRow title="Row Title">
          <div>Card</div>
        </HorizontalScrollRow>,
      );
      expect(
        screen.getByRole("heading", { name: "Row Title" }),
      ).toBeInTheDocument();
    });
  });
});
