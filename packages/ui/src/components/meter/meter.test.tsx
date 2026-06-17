import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Meter } from "./meter";

describe("Meter", () => {
  describe("rendering", () => {
    it("exposes the meter role with ARIA range values", () => {
      render(<Meter label="Disk" value={40} />);

      const meter = screen.getByRole("meter", { name: "Disk" });
      expect(meter).toHaveAttribute("aria-valuemin", "0");
      expect(meter).toHaveAttribute("aria-valuemax", "100");
      expect(meter).toHaveAttribute("aria-valuenow", "40");
    });

    it("forwards aria-valuetext", () => {
      render(<Meter label="Disk" value={40} valueText="40% used" />);

      expect(screen.getByRole("meter")).toHaveAttribute(
        "aria-valuetext",
        "40% used",
      );
    });

    it("applies custom className", () => {
      render(<Meter className="custom-class" label="Disk" value={40} />);

      expect(screen.getByRole("meter")).toHaveClass("custom-class");
    });
  });

  describe("value clamping", () => {
    it("clamps values above max", () => {
      render(<Meter label="Disk" max={50} value={120} />);

      expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "50");
    });

    it("clamps values below min", () => {
      render(<Meter label="Disk" min={10} value={-5} />);

      expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "10");
    });
  });

  describe("segments", () => {
    it("renders the requested number of segment blocks", () => {
      const { container } = render(
        <Meter label="Signal" max={5} segments={5} value={3} />,
      );

      const meter = screen.getByRole("meter");
      expect(meter.children).toHaveLength(5);
      expect(container.querySelector('[style*="width"]')).toBeNull();
    });
  });
});
