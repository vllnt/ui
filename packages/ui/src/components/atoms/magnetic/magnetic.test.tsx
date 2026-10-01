import { Activity, StrictMode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";
import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { Magnetic } from "./magnetic";

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
    <Magnetic style={style}>Pull me</Magnetic>,
  );
  const target = container.firstChild;
  if (!(target instanceof HTMLElement)) throw new Error("Expected element");
  const layout = vi
    .spyOn(target, "getBoundingClientRect")
    .mockReturnValue(bounds(0, 0, 100));
  return { layout, target, unmount };
}

function targetOf(container: HTMLElement): HTMLElement {
  const target = container.firstChild;
  if (!(target instanceof HTMLElement)) throw new Error("Expected element");
  vi.spyOn(target, "getBoundingClientRect").mockReturnValue(bounds(0, 0, 100));
  return target;
}

describe("Magnetic", () => {
  it("renders its children and merges className", () => {
    stubMatchMedia();
    const { container } = render(
      <Magnetic className="custom-class">Pull me</Magnetic>,
    );
    expect(screen.getByText("Pull me")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("Magnetic pointer tracking", () => {
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
    expect(target.style.transform).toBe("translate(20px, -20px)");

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
    expect(target.style.transform).toBe("translate(20px, -20px)");
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

describe("Magnetic lifecycle", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps following the pointer under StrictMode", () => {
    const frames = stubAnimationFrame();
    const { container } = render(
      <StrictMode>
        <Magnetic>Pull me</Magnetic>
      </StrictMode>,
    );
    const target = targetOf(container);

    movePointer(target, 100, 0);
    frames.flush();

    expect(target.style.transform).toBe("translate(20px, -20px)");
  });

  it("resumes after an Activity hide/show cancels a pending frame", () => {
    const frames = stubAnimationFrame();
    const view = render(
      <Activity mode="visible">
        <Magnetic>Pull me</Magnetic>
      </Activity>,
    );
    const target = targetOf(view.container);

    movePointer(target, 100, 0);
    view.rerender(
      <Activity mode="hidden">
        <Magnetic>Pull me</Magnetic>
      </Activity>,
    );
    view.rerender(
      <Activity mode="visible">
        <Magnetic>Pull me</Magnetic>
      </Activity>,
    );
    expect(frames.pending()).toBe(0);
    movePointer(target, 100, 0);
    frames.flush();

    expect(target.style.transform).toBe("translate(20px, -20px)");
  });

  it("runs the cleanup returned by a callback ref", () => {
    const cleanup = vi.fn();
    const ref = vi.fn((_node: HTMLDivElement | null) => cleanup);
    const { unmount } = render(<Magnetic ref={ref}>Pull me</Magnetic>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledTimes(1);
  });
});
