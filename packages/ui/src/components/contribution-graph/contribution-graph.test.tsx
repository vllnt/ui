import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContributionGraph } from "./contribution-graph";

const data = [
  { count: 2, date: "2026-01-05" },
  { count: 7, date: "2026-01-06" },
  { count: 0, date: "2026-01-07" },
  { count: 4, date: "2026-01-12" },
];

describe("ContributionGraph", () => {
  it("renders a titled cell for dated entries", () => {
    render(<ContributionGraph data={data} />);

    expect(
      screen.getByRole("img", { name: "Contribution graph" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2026-01-06: 7")).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <ContributionGraph className="custom-class" data={data} />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("returns null when no valid dated entries are provided", () => {
    const { container } = render(
      <ContributionGraph data={[{ count: 3, date: "not-a-date" }]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
