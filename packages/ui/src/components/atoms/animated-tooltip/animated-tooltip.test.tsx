import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../dialog/dialog";

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

describe("AnimatedTooltip inside a dialog", () => {
  it("closes itself on the first Escape and leaves the dialog open", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog onOpenChange={onOpenChange} open>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Tooltip inside a dialog.</DialogDescription>
          <AnimatedTooltip content="Hint">
            <button type="button">Trigger</button>
          </AnimatedTooltip>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });
    act(() => {
      trigger.focus();
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
