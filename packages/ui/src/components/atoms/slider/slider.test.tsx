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

  it("gives every value its own named thumb", () => {
    render(
      <Slider
        aria-label="Price range"
        defaultValue={[20, 80]}
        max={100}
        step={1}
      />,
    );
    const thumbs = screen.getAllByRole("slider", { name: "Price range" });
    expect(thumbs.map((thumb) => (thumb as HTMLInputElement).value)).toEqual([
      "20",
      "80",
    ]);
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

const part = (container: HTMLElement, slot: string) => {
  const element = container.querySelector(`[data-slot="slider-${slot}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No ${slot}`);
  return element;
};

describe("Slider parts", () => {
  it("merges each part's className with its defaults", () => {
    const { container } = render(
      <Slider
        aria-label="Volume"
        className="h-2.5"
        controlClassName="gap-1"
        defaultValue={[40]}
        rangeClassName="bg-success"
        thumbClassName="size-6"
        trackClassName="bg-muted"
      />,
    );
    expect(part(container, "control")).toHaveClass("relative", "gap-1");
    expect(part(container, "track")).toHaveClass("rounded-full", "bg-muted");
    expect(part(container, "track")).not.toHaveClass("bg-secondary");
    expect(part(container, "indicator")).toHaveClass("absolute", "bg-success");
    expect(part(container, "indicator")).not.toHaveClass("bg-primary");
    expect(part(container, "thumb")).toHaveClass("rounded-full", "size-6");
    expect(part(container, "thumb")).not.toHaveClass("size-5");
  });

  it("keeps the default part classes without the new props", () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[40]} />,
    );
    expect(part(container, "track").className).toBe(
      "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
    );
    expect(part(container, "indicator").className).toBe(
      "absolute h-full bg-primary",
    );
  });

  it("passes thumbProps to every thumb, over the root's name", () => {
    render(
      <Slider
        aria-label="Volume"
        defaultValue={[40]}
        thumbProps={{ "aria-label": "Music volume", "data-part": "knob" }}
      />,
    );
    expect(
      screen.getByRole("slider", { name: "Music volume" }),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="slider-thumb"]'),
    ).toHaveAttribute("data-part", "knob");
  });

  it("calls a thumbProps function with each thumb's index", () => {
    render(
      <Slider
        defaultValue={[20, 80]}
        thumbProps={(index) => ({
          "aria-label": index === 0 ? "Minimum price" : "Maximum price",
        })}
      />,
    );
    expect(screen.getByRole("slider", { name: "Minimum price" })).toHaveValue(
      "20",
    );
    expect(screen.getByRole("slider", { name: "Maximum price" })).toHaveValue(
      "80",
    );
  });
});
