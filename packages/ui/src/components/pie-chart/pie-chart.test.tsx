import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PieChart } from "./pie-chart";

const data = [
  { label: "Direct", value: 40 },
  { label: "Referral", value: 25 },
  { label: "Organic", value: 35 },
];

describe("PieChart", () => {
  it("renders a slice for each datum", () => {
    render(<PieChart data={data} />);

    expect(screen.getByRole("img", { name: "Pie chart" })).toBeInTheDocument();
    expect(screen.getByText("Direct: 40")).toBeInTheDocument();
    expect(screen.getByText("Organic: 35")).toBeInTheDocument();
  });

  it("renders as a donut when innerRadius is set", () => {
    const { container } = render(<PieChart data={data} innerRadius={0.6} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <PieChart className="custom-class" data={data} />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("returns null when no positive values are provided", () => {
    const { container } = render(
      <PieChart data={[{ label: "Empty", value: 0 }]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
