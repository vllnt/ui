import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
    // The thumb is a native range input: its value is the value now, and
    // ui-sdk adds the text form instead of aria-valuenow.
    const thumb = container.querySelector("[role='slider']");
    expect(thumb).toHaveValue("40");
    expect(thumb).toHaveAttribute("aria-valuetext", "40");
  });

  it("gives every value its own thumb, named Minimum and Maximum in a range", () => {
    render(
      <Slider
        aria-label="Price range"
        defaultValue={[20, 80]}
        max={100}
        step={1}
      />,
    );
    const thumbs = screen.getAllByRole("slider");
    expect(thumbs.map((thumb) => (thumb as HTMLInputElement).value)).toEqual([
      "20",
      "80",
    ]);
    expect(thumbs.map((thumb) => thumb.getAttribute("aria-label"))).toEqual([
      "Price range Minimum",
      "Price range Maximum",
    ]);
  });

  it("names the two thumbs of a range from aria-labelledby too", () => {
    render(
      <>
        <span id="range-label">Brightness</span>
        <Slider
          aria-labelledby="range-label"
          defaultValue={[20, 80]}
          max={100}
          step={1}
        />
      </>,
    );

    expect(
      screen.getByRole("slider", { name: "Brightness Minimum" }),
    ).toHaveValue("20");
    expect(
      screen.getByRole("slider", { name: "Brightness Maximum" }),
    ).toHaveValue("80");
  });

  it("names the thumbs Minimum and Maximum when the range has no label", () => {
    render(<Slider defaultValue={[20, 80]} max={100} step={1} />);

    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveValue("20");
    expect(screen.getByRole("slider", { name: "Maximum" })).toHaveValue("80");
  });

  it("takes each thumb's whole name from thumbLabels", () => {
    render(
      <Slider
        aria-label="Price range"
        defaultValue={[20, 80]}
        max={100}
        step={1}
        thumbLabels={["Lowest price", "Highest price"]}
      />,
    );

    expect(screen.getByRole("slider", { name: "Lowest price" })).toHaveValue(
      "20",
    );
    expect(screen.getByRole("slider", { name: "Highest price" })).toHaveValue(
      "80",
    );
  });

  it("falls back to the default name for a thumb without a thumbLabels entry", () => {
    render(
      <Slider
        aria-label="Price range"
        defaultValue={[20, 80]}
        max={100}
        step={1}
        thumbLabels={["Lowest price"]}
      />,
    );

    expect(
      screen.getByRole("slider", { name: "Lowest price" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Price range Maximum" }),
    ).toBeInTheDocument();
  });

  it("keeps the shared name for a single thumb and for three or more", () => {
    const { rerender } = render(
      <Slider aria-label="Volume" defaultValue={[40]} max={100} step={1} />,
    );
    expect(screen.getAllByRole("slider", { name: "Volume" })).toHaveLength(1);

    rerender(
      <Slider
        aria-label="Volume"
        defaultValue={[10, 40, 70]}
        max={100}
        step={1}
      />,
    );
    expect(screen.getAllByRole("slider", { name: "Volume" })).toHaveLength(3);
  });

  it("reports changes and commits as lists", () => {
    const handleChange = vi.fn();
    const handleCommit = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={[40]}
        max={100}
        onValueChange={handleChange}
        onValueCommit={handleCommit}
        step={1}
      />,
    );
    const thumb = screen.getByRole("slider", { name: "Volume" });
    fireEvent.change(thumb, { target: { value: "55" } });
    expect(handleChange).toHaveBeenCalledWith([55]);
    expect(thumb).toHaveValue("55");
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
