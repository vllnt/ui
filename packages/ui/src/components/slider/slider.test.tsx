import { render } from "@testing-library/react";
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
});
