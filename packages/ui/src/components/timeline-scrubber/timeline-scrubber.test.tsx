import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TimelineScrubber } from "./timeline-scrubber";

describe("TimelineScrubber", () => {
  it("renders the start, end, and cursor values", () => {
    render(
      <TimelineScrubber
        end={100}
        onValueChange={vi.fn()}
        start={0}
        value={25}
      />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("invokes onValueChange when the underlying range input changes", () => {
    const handleChange = vi.fn();
    render(
      <TimelineScrubber
        end={100}
        onValueChange={handleChange}
        start={0}
        value={25}
      />,
    );

    const input = screen.getByRole("slider");
    fireEvent.change(input, { target: { value: "60" } });
    expect(handleChange).toHaveBeenCalledWith(60);
  });

  it("clamps incoming value into the start..end range", () => {
    const { container } = render(
      <TimelineScrubber
        end={100}
        onValueChange={vi.fn()}
        start={0}
        value={500}
      />,
    );

    const fill = container.querySelector("[data-timeline-scrubber-fill]");
    expect(fill).toHaveStyle({ width: "100%" });
  });

  it("applies the formatValue callback when provided", () => {
    render(
      <TimelineScrubber
        end={3600}
        formatValue={(v) => `${v}s`}
        onValueChange={vi.fn()}
        start={0}
        value={1800}
      />,
    );

    expect(screen.getByText("1800s")).toBeInTheDocument();
    expect(screen.getByText("3600s")).toBeInTheDocument();
  });

  it("renders one tick per entry", () => {
    const { container } = render(
      <TimelineScrubber
        end={100}
        onValueChange={vi.fn()}
        start={0}
        ticks={[
          { id: "a", value: 25 },
          { id: "b", tone: "danger", value: 75 },
        ]}
        value={25}
      />,
    );

    expect(container.querySelectorAll("[data-scrubber-tick]")).toHaveLength(2);
    expect(container.querySelector("[data-scrubber-tick='b']")).toHaveAttribute(
      "data-scrubber-tick-tone",
      "danger",
    );
  });

  it("falls back to a 1-unit span when end is not greater than start", () => {
    render(
      <TimelineScrubber end={5} onValueChange={vi.fn()} start={5} value={5} />,
    );

    const input = screen.getByRole("slider");
    expect(input).toHaveAttribute("min", "5");
    expect(input).toHaveAttribute("max", "6");
  });
});
