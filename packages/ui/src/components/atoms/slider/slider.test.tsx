import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Slider } from "./slider";

describe("Slider", () => {
  it("renders the track and thumb", () => {
    const { container } = render(
      <Slider defaultValue={[40]} max={100} step={1} />,
    );
    expect(container.querySelector("[role='slider']")).toBeInTheDocument();
  });

  it("respects the defaultValue", () => {
    const { container } = render(
      <Slider defaultValue={[40]} max={100} step={1} />,
    );
    expect(container.querySelector("[role='slider']")).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
  });

  it("disables the slider when the disabled prop is set", () => {
    const { container } = render(
      <Slider defaultValue={[40]} disabled max={100} step={1} />,
    );
    expect(container.querySelector("[role='slider']")).toHaveAttribute(
      "data-disabled",
    );
  });

  it("merges the className prop on the root", () => {
    const { container } = render(
      <Slider className="extra" defaultValue={[40]} max={100} step={1} />,
    );
    expect(container.firstChild).toHaveClass("extra");
  });

  it("names the thumb from aria-label and aria-labelledby", () => {
    const { rerender } = render(
      <Slider aria-label="Volume" defaultValue={[40]} max={100} step={1} />,
    );
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    rerender(
      <>
        <span id="slider-label">Brightness</span>
        <Slider
          aria-labelledby="slider-label"
          defaultValue={[40]}
          max={100}
          step={1}
        />
      </>,
    );
    expect(
      screen.getByRole("slider", { name: "Brightness" }),
    ).toBeInTheDocument();
  });
});
