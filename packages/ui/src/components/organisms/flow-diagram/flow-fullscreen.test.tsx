import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FlowFullscreen } from "./flow-fullscreen";

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
      <FlowFullscreen
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <button type="button">inner</button>
      </FlowFullscreen>
    </>
  );
}

describe("FlowFullscreen focus management", () => {
  // jsdom has no layout: report one client rect so ui-sdk sees the controls as visible.
  beforeEach(() => {
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue(
      Object.assign([new DOMRect(0, 0, 1, 1)], { item: () => null }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps Tab inside the dialog and returns focus to the opener", async () => {
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();
    fireEvent.click(opener);

    const close = await screen.findByRole("button", {
      name: "Close fullscreen",
    });
    const inner = screen.getByRole("button", { name: "inner" });
    await waitFor(() => {
      expect(close).toHaveFocus();
    });

    inner.focus();
    fireEvent.keyDown(inner, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(inner).toHaveFocus();

    fireEvent.click(close);
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });

  it("closes on Escape", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "opener" }));

    fireEvent.keyDown(await screen.findByRole("dialog"), { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
