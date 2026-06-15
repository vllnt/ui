import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useBodyScrollLock } from "./use-body-scroll-lock";

beforeEach(() => {
  document.body.style.overflow = "";
});

describe("useBodyScrollLock", () => {
  it("locks body scroll while mounted", () => {
    renderHook(() => {
      useBodyScrollLock();
    });

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores the previous overflow on unmount", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => {
      useBodyScrollLock();
    });

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("does nothing while locked is false", () => {
    renderHook(() => {
      useBodyScrollLock(false);
    });

    expect(document.body.style.overflow).toBe("");
  });

  it("keeps the lock until the last overlapping consumer unlocks", () => {
    const first = renderHook(() => {
      useBodyScrollLock();
    });
    const second = renderHook(() => {
      useBodyScrollLock();
    });

    first.unmount();

    expect(document.body.style.overflow).toBe("hidden");

    second.unmount();

    expect(document.body.style.overflow).toBe("");
  });
});
