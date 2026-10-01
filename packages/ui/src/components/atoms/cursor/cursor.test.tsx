import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";
import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { Cursor } from "./cursor";

function movePointer(clientX: number, clientY: number): void {
  act(() => {
    window.dispatchEvent(
      new MouseEvent("pointermove", { bubbles: true, clientX, clientY }),
    );
  });
}

function follower(container: HTMLElement): HTMLElement {
  const element = container.firstChild;
  if (!(element instanceof HTMLElement)) throw new Error("Expected follower");
  return element;
}

describe("Cursor", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders with a custom class name and follows pointermove", () => {
    const frames = stubAnimationFrame();
    const { container } = render(<Cursor className="custom-class" />);
    const element = follower(container);
    expect(element).toHaveClass("custom-class", "opacity-0");

    movePointer(120, 80);
    frames.flush();

    expect(element.style.transform).toBe(
      "translate(120px, 80px) translate(-50%, -50%)",
    );
    expect(element).toHaveClass("opacity-100");
  });

  it("moves the follower once per frame, to the latest pointer position", () => {
    const frames = stubAnimationFrame();
    const { container } = render(<Cursor />);

    movePointer(10, 10);
    movePointer(20, 20);
    movePointer(30, 40);
    expect(frames.pending()).toBe(1);
    frames.flush();

    expect(follower(container).style.transform).toBe(
      "translate(30px, 40px) translate(-50%, -50%)",
    );
  });

  it("keeps a transform passed through style", () => {
    const frames = stubAnimationFrame();
    const { container } = render(<Cursor style={{ transform: "none" }} />);

    movePointer(120, 80);
    frames.flush();

    expect(follower(container).style.transform).toBe("none");
  });

  it("cancels a pending frame on unmount", () => {
    const frames = stubAnimationFrame();
    const { unmount } = render(<Cursor />);
    movePointer(120, 80);

    unmount();

    expect(frames.pending()).toBe(0);
  });
});
