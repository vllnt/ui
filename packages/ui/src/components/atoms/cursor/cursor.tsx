"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

/** Props for {@link Cursor}. */
export type CursorProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Diameter of the follower dot in pixels. Defaults to `24`. */
  size?: number;
};

type Point = {
  x: number;
  y: number;
};

/**
 * Follows the window pointer, writing the follower's `transform` at most once
 * per animation frame. Re-renders once, when the first pointer move makes the
 * follower visible.
 */
function usePointerFollower(
  follower: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
): boolean {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frame: null | number = null;
    let point: Point = { x: 0, y: 0 };

    const follow = (): void => {
      frame = null;
      setVisible(true);
      if (enabled && follower.current) {
        follower.current.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
      }
    };

    const onMove = (event: PointerEvent): void => {
      point = { x: event.clientX, y: event.clientY };
      frame ??= requestAnimationFrame(follow);
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [enabled, follower]);

  return visible;
}

/**
 * Circular follower that tracks the pointer as a custom cursor overlay.
 *
 * Pointer tracking is direct feedback and keeps following under reduced
 * motion; `motion-reduce` drops the smoothing transition.
 *
 * @example
 * ```tsx
 * <Cursor size={32} />
 * ```
 */
export const Cursor = ({
  className,
  ref,
  size = 24,
  style,
  ...props
}: CursorProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const follower = React.useRef<HTMLDivElement | null>(null);
  const visible = usePointerFollower(follower, style?.transform === undefined);

  const setReferences = React.useCallback(
    (node: HTMLDivElement | null): (() => void) => {
      follower.current = node;
      if (typeof ref === "function") {
        const cleanup = ref(node);
        return () => {
          follower.current = null;
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            ref(null);
          }
        };
      }
      if (ref) {
        ref.current = node;
      }
      return () => {
        follower.current = null;
        if (ref) {
          ref.current = null;
        }
      };
    },
    [ref],
  );

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground bg-foreground/20 backdrop-invert transition-transform duration-100 ease-out motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      ref={setReferences}
      style={{
        height: `${size}px`,
        width: `${size}px`,
        ...style,
      }}
      {...props}
    />
  );
};
Cursor.displayName = "Cursor";
