import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders an h3 title, description, icon, and actions inside a status region", () => {
    render(
      <EmptyState
        description="Try adjusting your search."
        icon={<svg aria-hidden="true" data-testid="icon" />}
        title="No results"
      >
        <button type="button">Clear filters</button>
      </EmptyState>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "No results" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search.")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
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

  it("honors a caller-provided role override", () => {
    render(
      <EmptyState role="region" title="x">
        y
      </EmptyState>,
    );
    expect(screen.getByRole("region")).toBeInTheDocument();
  });
});
