import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";
import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { TiltCard } from "./tilt-card";

function bounds(left: number, top: number, size: number): DOMRect {
  return {
    bottom: top + size,
    height: size,
    left,
    right: left + size,
    toJSON: () => ({}),
    top,
    width: size,
    x: left,
    y: top,
  };
}

function movePointer(target: Element, clientX: number, clientY: number): void {
  fireEvent(
    target,
    new MouseEvent("pointermove", { bubbles: true, clientX, clientY }),
  );
}

function renderTarget(style?: React.CSSProperties) {
  const { container, unmount } = render(
    <TiltCard style={style}>Hover me</TiltCard>,
  );
  const target = container.firstChild;
  if (!(target instanceof HTMLElement)) throw new Error("Expected element");
  const layout = vi
    .spyOn(target, "getBoundingClientRect")
    .mockReturnValue(bounds(0, 0, 100));
  return { layout, target, unmount };
}

describe("TiltCard", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <TiltCard className="custom-class">Hover me</TiltCard>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("TiltCard pointer tracking", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("follows the pointer on the next frame and resets on leave", () => {
    const frames = stubAnimationFrame();
    const { target } = renderTarget();

    movePointer(target, 100, 0);
    expect(target.style.transform).toBe("");
    frames.flush();
    expect(target.style.transform).toBe(
      "perspective(800px) rotateX(12deg) rotateY(12deg)",
    );

    fireEvent.pointerLeave(target);
    expect(target.style.transform).toBe("");
  });

  it("reads layout once per frame however many pointer moves arrive", () => {
    const frames = stubAnimationFrame();
    const { layout, target } = renderTarget();

    movePointer(target, 10, 90);
    movePointer(target, 60, 40);
    movePointer(target, 100, 0);
    expect(frames.pending()).toBe(1);
    frames.flush();

    expect(layout).toHaveBeenCalledTimes(1);
    expect(target.style.transform).toBe(
      "perspective(800px) rotateX(12deg) rotateY(12deg)",
    );
  });

  it("stays put under reduced motion", () => {
    stubMatchMedia(true);
    const frames = stubAnimationFrame();
    const { target } = renderTarget();

    movePointer(target, 100, 0);
    frames.flush();

    expect(target.style.transform).toBe("");
  });

  it("keeps a transform passed through style", () => {
    const frames = stubAnimationFrame();
    const { target } = renderTarget({ transform: "none" });

    movePointer(target, 100, 0);
    frames.flush();
    fireEvent.pointerLeave(target);

    expect(target.style.transform).toBe("none");
  });

  it("cancels a pending frame on unmount", () => {
    const frames = stubAnimationFrame();
    const { target, unmount } = renderTarget();
    movePointer(target, 100, 0);

    unmount();

    expect(frames.pending()).toBe(0);
  });
});
