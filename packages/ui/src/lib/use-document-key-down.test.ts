import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDocumentKeyDown, useEscapeKey } from "./use-document-key-down";

function pressKey(key: string): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { cancelable: true, key });
  document.dispatchEvent(event);
  return event;
}

describe("useDocumentKeyDown", () => {
  it("invokes the handler on keydown", () => {
    const handler = vi.fn();
    renderHook(() => {
      useDocumentKeyDown(handler);
    });

    pressKey("a");

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not listen while disabled", () => {
    const handler = vi.fn();
    renderHook(() => {
      useDocumentKeyDown(handler, { enabled: false });
    });

    pressKey("a");

    expect(handler).not.toHaveBeenCalled();
  });

  it("detaches on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => {
      useDocumentKeyDown(handler);
    });

    unmount();
    pressKey("a");

    expect(handler).not.toHaveBeenCalled();
  });

  it("always invokes the latest handler without re-attaching", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }: { handler: (event: KeyboardEvent) => void }) => {
        useDocumentKeyDown(handler);
      },
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    pressKey("a");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe("useEscapeKey", () => {
  it("fires on Escape only", () => {
    const onEscape = vi.fn();
    renderHook(() => {
      useEscapeKey(onEscape);
    });

    pressKey("a");
    pressKey("Escape");

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("respects the enabled flag", () => {
    const onEscape = vi.fn();
    renderHook(() => {
      useEscapeKey(onEscape, { enabled: false });
    });

    pressKey("Escape");

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("prevents default when configured", () => {
    renderHook(() => {
      useEscapeKey(vi.fn(), { preventDefault: true });
    });

    const event = pressKey("Escape");

    expect(event.defaultPrevented).toBe(true);
  });
});
