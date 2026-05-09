import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  FloatingToolbar,
  type FloatingToolbarAction,
} from "./floating-toolbar";

const noop = (): void => undefined;

describe("FloatingToolbar", () => {
  it("positions absolutely from x/y props", () => {
    const { container } = render(
      <FloatingToolbar
        actions={[{ id: "a", label: "A", onActivate: noop }]}
        x={120}
        y={80}
      />,
    );

    const toolbar = container.querySelector("[data-floating-toolbar]");
    expect(toolbar).toHaveStyle({ left: "120px", top: "80px" });
  });

  it("renders one button per action with the configured variant", () => {
    const actions: FloatingToolbarAction[] = [
      {
        id: "rename",
        label: "Rename",
        onActivate: noop,
        variant: "primary",
      },
      { id: "duplicate", label: "Duplicate", onActivate: noop },
      {
        id: "delete",
        label: "Delete",
        onActivate: noop,
        variant: "destructive",
      },
    ];
    const { container } = render(
      <FloatingToolbar actions={actions} x={0} y={0} />,
    );

    expect(
      container.querySelector("[data-action-id='rename']"),
    ).toHaveAttribute("data-variant", "primary");
    expect(
      container.querySelector("[data-action-id='duplicate']"),
    ).toHaveAttribute("data-variant", "ghost");
    expect(
      container.querySelector("[data-action-id='delete']"),
    ).toHaveAttribute("data-variant", "destructive");
  });

  it("fires onActivate when an action is clicked", () => {
    const onActivate = vi.fn();
    render(
      <FloatingToolbar
        actions={[{ id: "rename", label: "Rename", onActivate }]}
        x={0}
        y={0}
      />,
    );

    fireEvent.click(screen.getByText("Rename"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("disables actions when disabled is set", () => {
    const onActivate = vi.fn();
    render(
      <FloatingToolbar
        actions={[
          { disabled: true, id: "rename", label: "Rename", onActivate },
        ]}
        x={0}
        y={0}
      />,
    );

    const button = screen.getByText("Rename").closest("button");
    expect(button).toBeDisabled();
    if (button) fireEvent.click(button);
    expect(onActivate).not.toHaveBeenCalled();
  });
});
