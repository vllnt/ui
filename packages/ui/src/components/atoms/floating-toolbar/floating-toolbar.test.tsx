import { fireEvent, render, screen } from "@testing-library/react";
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
