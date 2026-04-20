import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricGauge } from "./metric-gauge";

describe("MetricGauge", () => {
  it("renders the gauge value and threshold label", () => {
    render(<MetricGauge label="CPU load" max={100} unit="%" value={72} />);

    expect(screen.getByText("CPU load")).toBeInTheDocument();
    expect(screen.getByLabelText("CPU load")).toBeInTheDocument();
    expect(screen.getAllByText("Elevated")).toHaveLength(2);
  });
});
