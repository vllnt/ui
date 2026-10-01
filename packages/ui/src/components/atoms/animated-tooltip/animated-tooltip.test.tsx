import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedTooltip } from "./animated-tooltip";

describe("AnimatedTooltip", () => {
  it("renders its trigger, merges className, and reveals the tooltip on pointer enter", () => {
    const { container } = render(
      <AnimatedTooltip className="custom-class" content="Hint">
        <button type="button">Trigger</button>
      </AnimatedTooltip>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    const wrapper = screen.getByText("Trigger").parentElement;
    expect(wrapper).not.toBeNull();
    if (wrapper) {
      fireEvent.pointerEnter(wrapper);
    }
    expect(screen.getByRole("tooltip")).toHaveTextContent("Hint");
  });
});

describe("AnimatedTooltip dismissal (WCAG 1.4.13)", () => {
  it("hides the tooltip on Escape without moving focus", () => {
    render(
      <AnimatedTooltip content="Hint">
        <button type="button">Trigger</button>
      </AnimatedTooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });
    act(() => {
      trigger.focus();
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
