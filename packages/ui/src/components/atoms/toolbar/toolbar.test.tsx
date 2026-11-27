import { createRef } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Toolbar, ToolbarSeparator } from "./toolbar";

function renderToolbar(orientation: "horizontal" | "vertical" = "horizontal") {
  return render(
    <Toolbar aria-label="Actions" orientation={orientation}>
      <button type="button">One</button>
      <button type="button">Two</button>
      <ToolbarSeparator />
      <button type="button">Three</button>
    </Toolbar>,
  );
}

function button(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

/** Focuses the control, as a user would, then presses the key on it. */
function press(element: HTMLElement, key: string): void {
  element.focus();
  fireEvent.keyDown(element, { key });
}

describe("Toolbar", () => {
  it("exposes the toolbar role, orientation, and separator", () => {
    renderToolbar();
    const toolbar = screen.getByRole("toolbar", { name: "Actions" });
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Toolbar aria-label="Actions" className="custom-class">
        <button type="button">One</button>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar")).toHaveClass("custom-class");
  });

  it.each([
    { from: "One", key: "ArrowRight", orientation: "horizontal", to: "Two" },
    { from: "Two", key: "ArrowLeft", orientation: "horizontal", to: "One" },
    { from: "Three", key: "ArrowRight", orientation: "horizontal", to: "One" },
    { from: "One", key: "ArrowDown", orientation: "vertical", to: "Two" },
  ] as const)(
    "$orientation: moves focus from $from on $key to $to",
    ({ from, key, orientation, to }) => {
      renderToolbar(orientation);
      press(button(from), key);
      expect(document.activeElement).toBe(button(to));
    },
  );

  it("jumps to the first and last controls on Home and End", () => {
    renderToolbar();
    press(button("Two"), "End");
    expect(document.activeElement).toBe(button("Three"));
    press(button("Three"), "Home");
    expect(document.activeElement).toBe(button("One"));
  });

  it("is one tab stop that follows focus", () => {
    renderToolbar();
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((item) => item.tabIndex)).toEqual([0, -1, -1]);
    button("Three").focus();
    expect(buttons.map((item) => item.tabIndex)).toEqual([-1, -1, 0]);
    press(button("Three"), "ArrowLeft");
    expect(buttons.map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("moves the tab stop off a control that gets disabled and onto new controls", async () => {
    const { rerender } = render(
      <Toolbar aria-label="Actions">
        <button type="button">One</button>
        <button type="button">Two</button>
      </Toolbar>,
    );
    rerender(
      <Toolbar aria-label="Actions">
        <button disabled type="button">
          One
        </button>
        <button type="button">Two</button>
        <button type="button">Three</button>
      </Toolbar>,
    );
    await waitFor(() => {
      expect(
        screen.getAllByRole("button").map((button) => button.tabIndex),
      ).toEqual([-1, 0, -1]);
    });
  });

  it("still runs the consumer's onKeyDown and navigates", () => {
    const onKeyDown = vi.fn();
    render(
      <Toolbar aria-label="Actions" onKeyDown={onKeyDown}>
        <button type="button">One</button>
        <button type="button">Two</button>
      </Toolbar>,
    );
    press(button("One"), "ArrowRight");
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button("Two"));
  });

  it("skips a control that is aria-disabled", () => {
    render(
      <Toolbar aria-label="Actions">
        <button type="button">One</button>
        <button aria-disabled="true" type="button">
          Busy
        </button>
        <button type="button">Three</button>
      </Toolbar>,
    );
    press(button("One"), "ArrowRight");
    expect(document.activeElement).toBe(button("Three"));
  });

  it("forwards ref to the toolbar element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Toolbar aria-label="Actions" ref={ref}>
        <button type="button">One</button>
      </Toolbar>,
    );
    expect(ref.current).toBe(screen.getByRole("toolbar"));
  });
});
