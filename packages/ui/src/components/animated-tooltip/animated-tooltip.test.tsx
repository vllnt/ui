import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedTooltip } from "./animated-tooltip";

describe("AnimatedTooltip", () => {
  it("renders its trigger", () => {
    render(
      <AnimatedTooltip content="Hint">
        <button type="button">Trigger</button>
      </AnimatedTooltip>,
    );

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <AnimatedTooltip className="custom-class" content="Hint">
        <button type="button">Trigger</button>
      </AnimatedTooltip>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("reveals the tooltip on pointer enter", () => {
    render(
      <AnimatedTooltip content="Hint">
        <button type="button">Trigger</button>
      </AnimatedTooltip>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    const wrapper = screen.getByText("Trigger").parentElement;
    expect(wrapper).not.toBeNull();
    if (wrapper) {
      fireEvent.pointerEnter(wrapper);
    }
    expect(screen.getByRole("tooltip")).toHaveTextContent("Hint");
  });
});
