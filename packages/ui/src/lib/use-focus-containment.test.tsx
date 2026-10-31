import { useRef, useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFocusContainment } from "./use-focus-containment";

function Harness() {
  const [open, setOpen] = useState(false);
  const reference = useRef<HTMLDivElement>(null);
  useFocusContainment(reference, open);
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
      {open ? (
        <div ref={reference}>
          <button type="button">first</button>
          <button disabled type="button">
            skipped
          </button>
          <button
            onClick={() => {
              setOpen(false);
            }}
            type="button"
          >
            last
          </button>
        </div>
      ) : null}
    </>
  );
}

function openHarness() {
  render(<Harness />);
  const opener = screen.getByRole("button", { name: "opener" });
  opener.focus();
  fireEvent.click(opener);
  return opener;
}

describe("useFocusContainment", () => {
  it("moves focus inside when enabled", () => {
    openHarness();
    expect(screen.getByRole("button", { name: "first" })).toHaveFocus();
  });

  it("wraps Tab from the last element to the first", () => {
    openHarness();
    screen.getByRole("button", { name: "last" }).focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Tab" });
    expect(screen.getByRole("button", { name: "first" })).toHaveFocus();
  });

  it("wraps Shift+Tab from the first element to the last", () => {
    openHarness();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Tab",
      shiftKey: true,
    });
    expect(screen.getByRole("button", { name: "last" })).toHaveFocus();
  });

  it("pulls focus back in when it is outside the container", () => {
    const opener = openHarness();
    opener.focus();
    fireEvent.keyDown(opener, { key: "Tab" });
    expect(screen.getByRole("button", { name: "first" })).toHaveFocus();
  });

  it("returns focus to the opener when disabled", () => {
    const opener = openHarness();
    fireEvent.click(screen.getByRole("button", { name: "last" }));
    expect(opener).toHaveFocus();
  });
});
