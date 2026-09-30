import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SankeyChart } from "./sankey-chart";

const nodes = [
  { id: "visits", label: "Visits" },
  { id: "signup", label: "Signup" },
  { id: "paid", label: "Paid" },
];

const links = [
  { source: "visits", target: "signup", value: 60 },
  { source: "signup", target: "paid", value: 25 },
];

describe("SankeyChart", () => {
  it("renders a label for each node and merges className", () => {
    const { container } = render(
      <SankeyChart className="custom-class" links={links} nodes={nodes} />,
    );
    expect(
      screen.getByRole("img", { name: "Sankey chart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Visits")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("ignores links that reference unknown nodes", () => {
    render(
      <SankeyChart
        links={[...links, { source: "ghost", target: "paid", value: 10 }]}
        nodes={nodes}
      />,
    );
    expect(
      screen.getByRole("img", { name: "Sankey chart" }),
    ).toBeInTheDocument();
  });

  it("returns null when no nodes are provided", () => {
    const { container } = render(<SankeyChart links={[]} nodes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
