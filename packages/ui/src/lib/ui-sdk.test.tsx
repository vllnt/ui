import * as React from "react";

import { render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useElementRef, useLazyElementRef } from "./ui-sdk";

/** Counts its renders and mounts one element through the ref. */
function Probe({
  onRender,
  ref,
  useRef,
}: {
  onRender: () => void;
  ref?: React.Ref<HTMLDivElement>;
  useRef: typeof useElementRef | typeof useLazyElementRef;
}) {
  const [, callback] = useRef(ref);
  onRender();

  return <div ref={callback} />;
}

/** Hands the lazy ref object to `capture`, so a test can read it after the render. */
function Reader({
  capture,
}: {
  capture: (element: React.RefObject<HTMLDivElement | null>) => void;
}) {
  const [element, callback] = useLazyElementRef<HTMLDivElement>();
  React.useEffect(() => {
    capture(element);
  }, [capture, element]);

  return <div data-testid="node" ref={callback} />;
}

describe("useLazyElementRef", () => {
  it("renders once when the element mounts, where useElementRef renders twice", () => {
    const lazy = vi.fn();
    const state = vi.fn();
    render(<Probe onRender={lazy} useRef={useLazyElementRef} />);
    render(<Probe onRender={state} useRef={useElementRef} />);

    expect(lazy).toHaveBeenCalledTimes(1);
    expect(state).toHaveBeenCalledTimes(2);
  });

  it("holds the element for a callback that reads it later", () => {
    const captured: React.RefObject<HTMLDivElement | null>[] = [];
    const { getByTestId, unmount } = render(
      <Reader
        capture={(element) => {
          captured.push(element);
        }}
      />,
    );

    expect(captured[0]?.current).toBe(getByTestId("node"));
    unmount();
    expect(captured[0]?.current).toBeNull();
  });

  it("still gives the element to the caller's function ref and object ref", () => {
    const callbackRef = vi.fn();
    const objectRef = React.createRef<HTMLDivElement>();

    const { container, rerender } = render(
      <Probe onRender={vi.fn()} ref={callbackRef} useRef={useLazyElementRef} />,
    );
    expect(callbackRef).toHaveBeenCalledWith(container.firstChild);

    rerender(
      <Probe onRender={vi.fn()} ref={objectRef} useRef={useLazyElementRef} />,
    );
    expect(callbackRef).toHaveBeenLastCalledWith(null);
    expect(objectRef.current).toBe(container.firstChild);
  });

  it("keeps the same callback while the ref stays the same", () => {
    const { rerender, result } = renderHook(() => useLazyElementRef());
    const first = result.current[1];
    rerender();

    expect(result.current[1]).toBe(first);
  });
});
