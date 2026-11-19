import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  FloatingToolbar,
  type FloatingToolbarAction,
} from "./floating-toolbar";

const noop = (): void => undefined;

describe("FloatingToolbar", () => {
  it("positions from x/y and renders one button per action with the configured variant", () => {
    const actions: FloatingToolbarAction[] = [
      { id: "rename", label: "Rename", onActivate: noop, variant: "primary" },
      { id: "duplicate", label: "Duplicate", onActivate: noop },
      {
        id: "delete",
        label: "Delete",
        onActivate: noop,
        variant: "destructive",
      },
    ];
    const { container } = render(
      <FloatingToolbar actions={actions} x={120} y={80} />,
    );
    expect(container.querySelector("[data-floating-toolbar]")).toHaveStyle({
      left: "120px",
      top: "80px",
    });
    const action = (id: string) =>
      container.querySelector(`[data-action-id='${id}']`);
    expect(action("rename")).toHaveAttribute("data-variant", "primary");
    expect(action("duplicate")).toHaveAttribute("data-variant", "ghost");
    expect(action("delete")).toHaveAttribute("data-variant", "destructive");
  });

  it("fires onActivate when an action is clicked, but not for disabled actions", () => {
    const onActivate = vi.fn();
    const onDisabled = vi.fn();
    render(
      <FloatingToolbar
        actions={[
          { id: "rename", label: "Rename", onActivate },
          { disabled: true, id: "lock", label: "Lock", onActivate: onDisabled },
        ]}
        x={0}
        y={0}
      />,
    );
    fireEvent.click(screen.getByText("Rename"));
    expect(onActivate).toHaveBeenCalledTimes(1);
    const disabled = screen.getByText("Lock").closest("button");
    expect(disabled).toBeDisabled();
    if (disabled) fireEvent.click(disabled);
    expect(onDisabled).not.toHaveBeenCalled();
  });
});

const keyboardActions: FloatingToolbarAction[] = [
  { id: "rename", label: "Rename", onActivate: noop },
  { id: "duplicate", label: "Duplicate", onActivate: noop },
  { disabled: true, id: "lock", label: "Lock", onActivate: noop },
  { id: "delete", label: "Delete", onActivate: noop },
];

const button = (name: string): HTMLElement =>
  screen.getByRole("button", { name });

const focusButton = (name: string): void => {
  act(() => {
    button(name).focus();
  });
};

describe("FloatingToolbar keyboard", () => {
  it("is one tab stop: only the first enabled action is tabbable", () => {
    render(<FloatingToolbar actions={keyboardActions} x={0} y={0} />);
    expect(button("Rename")).toHaveAttribute("tabindex", "0");
    expect(button("Duplicate")).toHaveAttribute("tabindex", "-1");
    expect(button("Delete")).toHaveAttribute("tabindex", "-1");
  });

  it("moves with the arrow keys, skips disabled actions and wraps at both ends", () => {
    render(<FloatingToolbar actions={keyboardActions} x={0} y={0} />);
    focusButton("Rename");

    fireEvent.keyDown(button("Rename"), { key: "ArrowRight" });
    expect(button("Duplicate")).toHaveFocus();
    fireEvent.keyDown(button("Duplicate"), { key: "ArrowRight" });
    expect(button("Delete")).toHaveFocus();
    fireEvent.keyDown(button("Delete"), { key: "ArrowRight" });
    expect(button("Rename")).toHaveFocus();
    fireEvent.keyDown(button("Rename"), { key: "ArrowLeft" });
    expect(button("Delete")).toHaveFocus();
    fireEvent.keyDown(button("Delete"), { key: "ArrowLeft" });
    expect(button("Duplicate")).toHaveFocus();
  });

  it("jumps to the first and last enabled action with Home and End", () => {
    render(<FloatingToolbar actions={keyboardActions} x={0} y={0} />);
    focusButton("Duplicate");

    fireEvent.keyDown(button("Duplicate"), { key: "End" });
    expect(button("Delete")).toHaveFocus();
    fireEvent.keyDown(button("Delete"), { key: "Home" });
    expect(button("Rename")).toHaveFocus();
  });

  it("moves the tab stop to the focused action", () => {
    render(<FloatingToolbar actions={keyboardActions} x={0} y={0} />);
    focusButton("Rename");
    fireEvent.keyDown(button("Rename"), { key: "ArrowRight" });

    expect(button("Duplicate")).toHaveAttribute("tabindex", "0");
    expect(button("Rename")).toHaveAttribute("tabindex", "-1");
  });

  it("keeps a tab stop when the focused action becomes disabled", () => {
    const { rerender } = render(
      <FloatingToolbar actions={keyboardActions} x={0} y={0} />,
    );
    focusButton("Duplicate");
    rerender(
      <FloatingToolbar
        actions={keyboardActions.map((action) =>
          action.id === "duplicate" ? { ...action, disabled: true } : action,
        )}
        x={0}
        y={0}
      />,
    );

    expect(button("Rename")).toHaveAttribute("tabindex", "0");
  });

  it("leaves other keys alone, so Tab still leaves the toolbar", () => {
    render(<FloatingToolbar actions={keyboardActions} x={0} y={0} />);
    focusButton("Rename");

    expect(fireEvent.keyDown(button("Rename"), { key: "Tab" })).toBe(true);
    expect(fireEvent.keyDown(button("Rename"), { key: "a" })).toBe(true);
    expect(fireEvent.keyDown(button("Rename"), { key: "ArrowRight" })).toBe(
      false,
    );
  });

  it("ignores arrow keys that do not come from an action button", () => {
    render(<FloatingToolbar actions={keyboardActions} x={0} y={0} />);
    focusButton("Rename");

    const toolbar = screen.getByRole("toolbar");
    expect(fireEvent.keyDown(toolbar, { key: "ArrowRight" })).toBe(true);
    expect(button("Rename")).toHaveFocus();
  });

  it("runs a consumer onKeyDown first and respects its preventDefault", () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => {
      event.preventDefault();
    });
    render(
      <FloatingToolbar
        actions={keyboardActions}
        onKeyDown={onKeyDown}
        x={0}
        y={0}
      />,
    );
    focusButton("Rename");
    fireEvent.keyDown(button("Rename"), { key: "ArrowRight" });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(button("Rename")).toHaveFocus();
  });

  it("stops the colour transition under reduced motion", () => {
    render(<FloatingToolbar actions={keyboardActions} x={0} y={0} />);
    expect(button("Rename")).toHaveClass(
      "transition-colors",
      "motion-reduce:transition-none",
    );
  });
});
