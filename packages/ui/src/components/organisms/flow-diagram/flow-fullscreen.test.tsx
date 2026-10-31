import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
  it("keeps Tab inside the dialog and returns focus to the opener", () => {
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();
    fireEvent.click(opener);

    const close = screen.getByRole("button", { name: "Close fullscreen" });
    const inner = screen.getByRole("button", { name: "inner" });
    expect(close).toHaveFocus();

    inner.focus();
    fireEvent.keyDown(inner, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(inner).toHaveFocus();

    fireEvent.click(close);
    expect(opener).toHaveFocus();
  });
});
