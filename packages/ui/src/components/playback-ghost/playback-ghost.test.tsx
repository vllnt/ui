import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaybackGhost } from "./playback-ghost";

describe("PlaybackGhost", () => {
  it("centers the ghost on the cx/cy point", () => {
    const { container } = render(<PlaybackGhost size={50} x={120} y={80} />);

    expect(container.querySelector("[data-playback-ghost]")).toHaveStyle({
      left: `${120 - 50 / 2}px`,
      top: `${80 - 50 / 2}px`,
    });
  });

  it("renders the kind glyph + label", () => {
    render(<PlaybackGhost kind="run" label="research-2025" x={0} y={0} />);

    expect(screen.getByText("research-2025")).toBeInTheDocument();
    expect(screen.getByLabelText("Playback ghost: Run")).toBeInTheDocument();
  });

  it("propagates kind to a data attribute", () => {
    const { container } = render(<PlaybackGhost kind="task" x={0} y={0} />);

    expect(container.querySelector("[data-playback-ghost]")).toHaveAttribute(
      "data-playback-kind",
      "task",
    );
  });

  it("falls back to 'unknown' when kind is omitted", () => {
    const { container } = render(<PlaybackGhost x={0} y={0} />);

    expect(container.querySelector("[data-playback-ghost]")).toHaveAttribute(
      "data-playback-kind",
      "unknown",
    );
  });

  it("clamps opacity into 0..1", () => {
    const { container } = render(<PlaybackGhost opacity={5} x={0} y={0} />);

    expect(container.querySelector("[data-playback-ghost]")).toHaveStyle({
      opacity: "1",
    });
  });

  it("clamps size to a sane minimum", () => {
    const { container } = render(<PlaybackGhost size={4} x={0} y={0} />);

    expect(container.querySelector("[data-playback-ghost]")).toHaveStyle({
      "min-width": "16px",
    });
  });
});
