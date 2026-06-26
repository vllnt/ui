import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RadarChart } from "./radar-chart";

const data = [
  { label: "Speed", value: 80 },
  { label: "Power", value: 60 },
  { label: "Range", value: 90 },
  { label: "Agility", value: 70 },
];

describe("RadarChart", () => {
  it("renders an axis label for each datum", () => {
    render(<RadarChart data={data} max={100} />);

    expect(
      screen.getByRole("img", { name: "Radar chart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Speed")).toBeInTheDocument();
    expect(screen.getByText("Agility")).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <RadarChart className="custom-class" data={data} />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("returns null with fewer than three axes", () => {
    const { container } = render(
      <RadarChart
        data={[
          { label: "A", value: 1 },
          { label: "B", value: 2 },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
