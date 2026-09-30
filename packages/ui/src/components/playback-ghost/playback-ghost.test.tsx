import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaybackGhost } from "./playback-ghost";

const ghost = (container: HTMLElement) =>
  container.querySelector("[data-playback-ghost]");

describe("PlaybackGhost", () => {
  it("centers the ghost on the cx/cy point", () => {
    const { container } = render(<PlaybackGhost size={50} x={120} y={80} />);
    expect(ghost(container)).toHaveStyle({ left: "120px", top: "80px" });
    expect(ghost(container)?.className).toMatch(/-translate-x-1\/2/);
    expect(ghost(container)?.className).toMatch(/-translate-y-1\/2/);
  });

  it("renders the kind glyph + label", () => {
    render(<PlaybackGhost kind="run" label="research-2025" x={0} y={0} />);
    expect(screen.getByText("research-2025")).toBeInTheDocument();
    expect(screen.getByLabelText("Playback ghost: Run")).toBeInTheDocument();
  });

  it.each([
    ["task", "task"],
    [undefined, "unknown"],
  ] as const)(
    "propagates kind %s to a data attribute as %s",
    (kind, expected) => {
      const { container } = render(<PlaybackGhost kind={kind} x={0} y={0} />);
      expect(ghost(container)).toHaveAttribute("data-playback-kind", expected);
    },
  );

  it.each([
    ["opacity into 0..1", { opacity: 5 }, { opacity: "1" }],
    ["size to a sane minimum", { size: 4 }, { "min-width": "16px" }],
  ])("clamps %s", (_case, props, style) => {
    const { container } = render(<PlaybackGhost {...props} x={0} y={0} />);
    expect(ghost(container)).toHaveStyle(style);
  });
});
