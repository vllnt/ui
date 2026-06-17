import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GaugeChart } from "./gauge-chart";

describe("GaugeChart", () => {
  it("renders the value and label", () => {
    render(<GaugeChart label="CPU load" value={72} />);

    expect(
      screen.getByRole("img", { name: "Gauge chart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("CPU load")).toBeInTheDocument();
  });

  it("clamps the value into the configured range", () => {
    render(<GaugeChart max={100} min={0} value={150} />);

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Gauge chart" }),
    ).toBeInTheDocument();
  });

  it("hides the value when showValue is false", () => {
    render(<GaugeChart showValue={false} value={42} />);

    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <GaugeChart className="custom-class" value={10} />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
