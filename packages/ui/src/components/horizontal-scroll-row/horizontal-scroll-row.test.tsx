import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HorizontalScrollRow } from "./horizontal-scroll-row";

describe("HorizontalScrollRow", () => {
  it("renders a section with heading title, description, children, and className", () => {
    render(
      <HorizontalScrollRow
        className="custom-class"
        description="Optional text"
        title="Row Title"
      >
        <div>Card A</div>
        <div>Card B</div>
      </HorizontalScrollRow>,
    );
    expect(
      screen.getByRole("heading", { name: "Row Title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Optional text")).toBeInTheDocument();
    expect(screen.getByText("Card A")).toBeInTheDocument();
    expect(screen.getByText("Card B")).toBeInTheDocument();
    expect(screen.getByText("Row Title").closest("section")).toHaveClass(
      "custom-class",
    );
  });

  it("does not render description when omitted", () => {
    render(
      <HorizontalScrollRow title="Design">
        <div>Card 1</div>
      </HorizontalScrollRow>,
    );
    expect(screen.getByText("Design").closest("section")).toBeInTheDocument();
    expect(screen.queryByText("Optional text")).not.toBeInTheDocument();
  });
});
