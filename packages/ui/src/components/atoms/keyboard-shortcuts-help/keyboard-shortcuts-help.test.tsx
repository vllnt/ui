import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    [
      "Escape is pressed",
      () => fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" }),
    ],
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

describe("KeyboardShortcutsHelp focus management", () => {
  // jsdom has no layout: report one client rect so ui-sdk sees the controls as visible.
  beforeEach(() => {
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => {
            setOpen(true);
          }}
          type="button"
        >
          opener
        </button>
        <KeyboardShortcutsHelp
          isOpen={open}
          onClose={() => {
            setOpen(false);
          }}
          shortcuts={shortcuts}
        />
      </>
    );
  }

  it("keeps Tab inside the dialog and returns focus to the opener", async () => {
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();
    fireEvent.click(opener);
    const close = await screen.findByRole("button", {
      name: "Close shortcuts help",
    });
    await waitFor(() => {
      expect(close).toHaveFocus();
    });

    fireEvent.keyDown(close, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(close).toHaveFocus();

    fireEvent.click(close);
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });
});

describe("KeyboardShortcutsHelp open and onOpenChange", () => {
  it("opens with open, and reports a close through onOpenChange and onClose", () => {
    const handleClose = vi.fn();
    const handleOpenChange = vi.fn();
    render(
      <KeyboardShortcutsHelp
        onClose={handleClose}
        onOpenChange={handleOpenChange}
        open
        shortcuts={shortcuts}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("names the dialog by its title and locks page scroll while open", async () => {
    const { rerender } = render(
      <KeyboardShortcutsHelp isOpen shortcuts={shortcuts} title="Hotkeys" />,
    );
    expect(screen.getByRole("dialog", { name: "Hotkeys" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    await waitFor(() => {
      expect(document.documentElement.style.overflow).toBe("hidden");
    });

    rerender(<KeyboardShortcutsHelp shortcuts={shortcuts} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
