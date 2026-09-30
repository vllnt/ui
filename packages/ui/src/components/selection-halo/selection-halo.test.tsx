import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SelectionHalo } from "./selection-halo";

const SQUARE = { height: 100, width: 100, x: 0, y: 0 };

describe("SelectionHalo", () => {
  it("positions and sizes from bounds props", () => {
    const { container } = render(
      <SelectionHalo bounds={{ height: 120, width: 200, x: 80, y: 60 }} />,
    );
    const halo = container.querySelector("[data-selection-halo]");
    expect(halo).toHaveStyle({
      height: "120px",
      left: "80px",
      top: "60px",
      width: "200px",
    });
  });

  it("renders a corner handle at each of the four corners", () => {
    const { container } = render(<SelectionHalo bounds={SQUARE} />);
    ["nw", "ne", "se", "sw"].forEach((corner) => {
      expect(
        container.querySelector(`[data-handle-corner='${corner}']`),
      ).toBeInTheDocument();
    });
  });

  it("renders the label chip when label is set", () => {
    render(<SelectionHalo bounds={SQUARE} label="3 selected" />);
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("emits data-pulsing when pulsing is true", () => {
    const { container } = render(<SelectionHalo bounds={SQUARE} pulsing />);
    expect(container.querySelector("[data-selection-halo]")).toHaveAttribute(
      "data-pulsing",
      "true",
    );
  });
});
