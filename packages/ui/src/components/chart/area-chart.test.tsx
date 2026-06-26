import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AreaChart } from "./area-chart";

const data = [
  { label: "Jan", value: 10 },
  { label: "Feb", value: 25 },
  { label: "Mar", value: 18 },
];

describe("AreaChart", () => {
  it("renders the chart from data", () => {
    render(<AreaChart data={data} />);

    expect(screen.getByRole("img", { name: "Area chart" })).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <AreaChart className="custom-class" data={data} />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("returns null when no data is provided", () => {
    const { container } = render(<AreaChart data={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
