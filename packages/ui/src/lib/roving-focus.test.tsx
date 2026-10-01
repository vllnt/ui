import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { moveRovingFocus } from "./roving-focus";

function Toolbar() {
  return (
    <div
      onKeyDown={(event) => {
        moveRovingFocus(event, "button");
      }}
      role="toolbar"
      tabIndex={-1}
    >
      <button type="button">One</button>
      <button aria-disabled="true" type="button">
        Two
      </button>
      <button type="button">Three</button>
    </div>
  );
}

describe("moveRovingFocus", () => {
  it("skips aria-disabled items", () => {
    render(<Toolbar />);
    const one = screen.getByRole("button", { name: "One" });
    act(() => {
      one.focus();
    });
    fireEvent.keyDown(one, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Three" })).toHaveFocus();
  });

  it("lets focus leave an aria-disabled item that currently holds it", () => {
    render(<Toolbar />);
    const two = screen.getByRole("button", { name: "Two" });
    act(() => {
      two.focus();
    });
    fireEvent.keyDown(two, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Three" })).toHaveFocus();
    act(() => {
      two.focus();
    });
    fireEvent.keyDown(two, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
  });
});
