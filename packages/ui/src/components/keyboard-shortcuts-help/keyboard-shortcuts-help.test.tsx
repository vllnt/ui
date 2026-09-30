import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";

const shortcuts = [
  { description: "Pan canvas", keys: ["Space", "Drag"] },
  { description: "Zoom in", keys: ["Cmd", "+"] },
];

describe("KeyboardShortcutsHelp", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <KeyboardShortcutsHelp
        isOpen={false}
        onClose={vi.fn()}
        shortcuts={shortcuts}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the title and shortcut rows when open", () => {
    render(
      <KeyboardShortcutsHelp isOpen onClose={vi.fn()} shortcuts={shortcuts} />,
    );
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Pan canvas")).toBeInTheDocument();
    expect(screen.getByText("Zoom in")).toBeInTheDocument();
  });

  it("uses the override title when provided", () => {
    render(
      <KeyboardShortcutsHelp
        isOpen
        onClose={vi.fn()}
        shortcuts={shortcuts}
        title="Hotkeys"
      />,
    );
    expect(screen.getByText("Hotkeys")).toBeInTheDocument();
  });

  it.each([
    ["Escape is pressed", () => fireEvent.keyDown(window, { key: "Escape" })],
    [
      "the close button is clicked",
      () => fireEvent.click(screen.getByRole("button")),
    ],
  ])("invokes onClose when %s", (_name, act) => {
    const handleClose = vi.fn();
    render(
      <KeyboardShortcutsHelp
        isOpen
        onClose={handleClose}
        shortcuts={shortcuts}
      />,
    );
    act();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
