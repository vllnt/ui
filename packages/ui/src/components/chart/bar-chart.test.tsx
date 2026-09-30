import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BarChart } from "./bar-chart";

const data = [
  { label: "Jan", value: 10 },
  { label: "Feb", value: 25 },
  { label: "Mar", value: 18 },
];

describe("BarChart", () => {
  it("renders the chart from data and merges className", () => {
    const { container } = render(
      <BarChart className="custom-class" data={data} />,
    );
    expect(screen.getByRole("img", { name: "Bar chart" })).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("returns null when no data is provided", () => {
    const { container } = render(<BarChart data={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
