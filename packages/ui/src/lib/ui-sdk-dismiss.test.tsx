import * as React from "react";

import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  callPreventDefault,
  DismissContext,
  type DismissHandlers,
  runDismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
} from "./ui-sdk-dismiss";

const cancelable = (type: string) =>
  new Event(type, { bubbles: true, cancelable: true });

describe("callPreventDefault", () => {
  it("tells that a handler vetoed, though the event was prevented already", () => {
    const event = cancelable("keydown");
    event.preventDefault();

    expect(callPreventDefault(event, [vi.fn()])).toBe(false);
    expect(
      callPreventDefault(event, [
        (seen) => {
          seen.preventDefault();
        },
      ]),
    ).toBe(true);
  });

  it("gives the handlers the event's own properties and methods", () => {
    const event = cancelable("pointerdown");
    const seen = vi.fn();

    callPreventDefault(event, [
      (watched) => {
        seen(watched.type, watched.bubbles);
        watched.stopPropagation();
      },
      undefined,
    ]);

    expect(seen).toHaveBeenCalledWith("pointerdown", true);
  });
});

const run = (handlers: DismissHandlers, reason: string, event?: Event) => {
  const cancel = vi.fn();
  runDismissHandlers(handlers, { cancel, event, reason });

  return cancel;
};

describe("runDismissHandlers", () => {
  it("gives outside callbacks the DOM event in detail.originalEvent, as Radix did", () => {
    const pointer = cancelable("pointerdown");
    const focus = cancelable("focusin");
    const keydown = cancelable("keydown");
    const seen: unknown[] = [];

    run(
      {
        onFocusOutside: (event) => seen.push(event.detail.originalEvent),
        onInteractOutside: (event) => seen.push(event.detail.originalEvent),
        onPointerDownOutside: (event) => seen.push(event.detail.originalEvent),
      },
      "outside-press",
      pointer,
    );
    run(
      { onFocusOutside: (event) => seen.push(event.detail.originalEvent) },
      "focus-out",
      focus,
    );
    run(
      { onEscapeKeyDown: (event) => seen.push(event.detail) },
      "escape-key",
      keydown,
    );

    expect(seen).toHaveLength(4);
    expect(seen[0]).toBe(pointer);
    expect(seen[1]).toBe(pointer);
    expect(seen[2]).toBe(focus);
    // Escape callbacks get the keyboard event itself, with no detail added.
    expect(seen[3]).toBeUndefined();
  });

  it("runs the callbacks for each reason and cancels on preventDefault", () => {
    const onEscapeKeyDown = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const onFocusOutside = vi.fn();
    const onInteractOutside = vi.fn();
    const onPointerDownOutside = vi.fn();
    const handlers = {
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    };

    expect(
      run(handlers, "escape-key", cancelable("keydown")),
    ).toHaveBeenCalled();
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).not.toHaveBeenCalled();

    expect(
      run(handlers, "outside-press", cancelable("pointerdown")),
    ).not.toHaveBeenCalled();
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);

    run(handlers, "focus-out", cancelable("focusin"));
    expect(onFocusOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(2);
  });

  it("ignores other reasons and events it was not given", () => {
    const onEscapeKeyDown = vi.fn();

    expect(
      run({ onEscapeKeyDown }, "trigger-press", cancelable("click")),
    ).not.toHaveBeenCalled();
    expect(run({ onEscapeKeyDown }, "escape-key")).not.toHaveBeenCalled();
    expect(onEscapeKeyDown).not.toHaveBeenCalled();
  });
});

/** Like ui-sdk's details: `cancel()` marks the change as canceled. */
const details = (canceled: boolean, reason = "escape-key") => {
  const value = {
    cancel: vi.fn(() => {
      value.canceled = true;
    }),
    canceled,
    event: cancelable("keydown"),
    reason,
  };

  return value;
};

describe("useDismissRoot", () => {
  it("reports the change unless a callback kept the popup open", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDismissRoot(onOpenChange));
    result.current.ref.current = {
      onEscapeKeyDown: (event) => {
        event.preventDefault();
      },
    };

    result.current.handleOpenChange(true, details(false));
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    const kept = details(false);
    result.current.handleOpenChange(false, kept);
    expect(kept.cancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    result.current.ref.current = {};
    result.current.handleOpenChange(false, details(false));
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
  });
});

describe("useRegisterDismissHandlers", () => {
  it("hands the latest callbacks to the root's ref", () => {
    const ref =
      React.createRef<DismissHandlers>() as React.RefObject<DismissHandlers>;
    const first = vi.fn();
    const second = vi.fn();
    const Content = ({ onEscapeKeyDown }: DismissHandlers) => {
      useRegisterDismissHandlers({ onEscapeKeyDown });

      return <p>content</p>;
    };
    const { rerender } = render(
      <DismissContext value={ref}>
        <Content onEscapeKeyDown={first} />
      </DismissContext>,
    );
    expect(ref.current.onEscapeKeyDown).toBe(first);

    rerender(
      <DismissContext value={ref}>
        <Content onEscapeKeyDown={second} />
      </DismissContext>,
    );
    expect(ref.current.onEscapeKeyDown).toBe(second);
  });

  it("does nothing outside a root", () => {
    const Content = () => {
      useRegisterDismissHandlers({ onEscapeKeyDown: vi.fn() });

      return <p>content</p>;
    };
    render(<Content />);
    fireEvent.keyDown(screen.getByText("content"), { key: "Escape" });

    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
