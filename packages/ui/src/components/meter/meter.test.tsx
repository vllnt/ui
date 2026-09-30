import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Meter } from "./meter";

describe("Meter", () => {
  it("exposes the meter role with ARIA range values, valuetext and className", () => {
    render(
      <Meter
        className="custom-class"
        label="Disk"
        value={40}
        valueText="40% used"
      />,
    );
    const meter = screen.getByRole("meter", { name: "Disk" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuenow", "40");
    expect(meter).toHaveAttribute("aria-valuetext", "40% used");
    expect(meter).toHaveClass("custom-class");
  });

  it.each([
    ["above max", { max: 50, value: 120 }, "50"],
    ["below min", { min: 10, value: -5 }, "10"],
  ])("clamps values %s", (_case, props, expected) => {
    render(<Meter label="Disk" {...props} />);
    expect(screen.getByRole("meter")).toHaveAttribute(
      "aria-valuenow",
      expected,
    );
  });

  it("renders the requested number of segment blocks", () => {
    const { container } = render(
      <Meter label="Signal" max={5} segments={5} value={3} />,
    );
    expect(screen.getByRole("meter").children).toHaveLength(5);
    expect(container.querySelector('[style*="width"]')).toBeNull();
  });
});
