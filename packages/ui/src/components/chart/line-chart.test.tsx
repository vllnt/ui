import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LineChart } from "./line-chart";

const data = [
  { label: "Jan", value: 10 },
  { label: "Feb", value: 25 },
  { label: "Mar", value: 18 },
];

describe("LineChart", () => {
  it("renders the chart from data", () => {
    render(<LineChart data={data} />);

    expect(screen.getByRole("img", { name: "Line chart" })).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <LineChart className="custom-class" data={data} />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("returns null when no data is provided", () => {
    const { container } = render(<LineChart data={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
