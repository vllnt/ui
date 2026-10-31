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

  it("returns focus to the opener when a child uses autoFocus", () => {
    function AutoFocusHarness() {
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
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input aria-label="field" autoFocus />
              <button
                onClick={() => {
                  setOpen(false);
                }}
                type="button"
              >
                close
              </button>
            </div>
          ) : null}
        </>
      );
    }
    render(<AutoFocusHarness />);
    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole("textbox", { name: "field" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(opener).toHaveFocus();
  });

  it("lets only the most recently enabled containment handle Tab", () => {
    function Nested() {
      const outerReference = useRef<HTMLDivElement>(null);
      const innerReference = useRef<HTMLDivElement>(null);
      const [inner, setInner] = useState(false);
      useFocusContainment(outerReference, true);
      useFocusContainment(innerReference, inner);
      return (
        <>
          <div ref={outerReference}>
            <button
              onClick={() => {
                setInner(true);
              }}
              type="button"
            >
              outer-a
            </button>
            <button type="button">outer-b</button>
          </div>
          {inner ? (
            <div ref={innerReference}>
              <button type="button">inner-a</button>
              <button type="button">inner-b</button>
            </div>
          ) : null}
        </>
      );
    }
    render(<Nested />);
    fireEvent.click(screen.getByRole("button", { name: "outer-a" }));
    screen.getByRole("button", { name: "inner-b" }).focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Tab" });
    expect(screen.getByRole("button", { name: "inner-a" })).toHaveFocus();
  });

  it("does not restore focus to an element that blurred to nothing", () => {
    function Controlled({ open }: { open: boolean }) {
      const reference = useRef<HTMLDivElement>(null);
      useFocusContainment(reference, open);
      return (
        <>
          <button type="button">stale</button>
          {open ? (
            <div ref={reference}>
              <button type="button">inside</button>
            </div>
          ) : null}
        </>
      );
    }
    const { rerender } = render(<Controlled open={false} />);
    const stale = screen.getByRole("button", { name: "stale" });
    stale.focus();
    stale.blur();
    rerender(<Controlled open />);
    expect(screen.getByRole("button", { name: "inside" })).toHaveFocus();
    rerender(<Controlled open={false} />);
    expect(stale).not.toHaveFocus();
  });

  it("leaves focus in the upper containment when a lower one closes", () => {
    function Stacked({ lower, upper }: { lower: boolean; upper: boolean }) {
      const lowerReference = useRef<HTMLDivElement>(null);
      const upperReference = useRef<HTMLDivElement>(null);
      useFocusContainment(lowerReference, lower);
      useFocusContainment(upperReference, upper);
      return (
        <>
          <button type="button">page</button>
          <div ref={lowerReference}>
            <button type="button">lower</button>
          </div>
          <div ref={upperReference}>
            <button type="button">upper</button>
          </div>
        </>
      );
    }
    const { rerender } = render(<Stacked lower={false} upper={false} />);
    screen.getByRole("button", { name: "page" }).focus();
    rerender(<Stacked lower upper={false} />);
    rerender(<Stacked lower upper />);
    expect(screen.getByRole("button", { name: "upper" })).toHaveFocus();
    rerender(<Stacked lower={false} upper />);
    expect(screen.getByRole("button", { name: "upper" })).toHaveFocus();
  });

  it("skips inert ancestors and hidden inputs", () => {
    function Skip() {
      const reference = useRef<HTMLDivElement>(null);
      useFocusContainment(reference, true);
      return (
        <div ref={reference}>
          <button type="button">only</button>
          <div {...{ inert: "" }}>
            <button type="button">inert-child</button>
          </div>
          <input type="hidden" />
        </div>
      );
    }
    render(<Skip />);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Tab" });
    expect(screen.getByRole("button", { name: "only" })).toHaveFocus();
  });
});
