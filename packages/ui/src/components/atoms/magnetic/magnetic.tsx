"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

/** Props for {@link Magnetic}. */
export type MagneticProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Fraction of the pointer offset applied as pull. Defaults to `0.4`. */
  strength?: number;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (): void => {
      setReduced(query.matches);
    };

    onChange();
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  return reduced;
}

type Point = { x: number; y: number };

type PointerTransformOptions = {
  /** Builds the `transform` for the latest pointer position. */
  compute: (pointer: Point, bounds: DOMRect) => string;
  /** False under reduced motion, which makes the hook skip pointer moves. */
  enabled: boolean;
  /** True when the consumer passed `style.transform`, which always wins. */
  keepTransform: boolean;
};

/**
 * Applies a pointer-driven `transform` at most once per animation frame by
 * writing the element's style directly, so pointer moves never re-render.
 * Leaving the element clears the transform. The element comes from the
 * event, so the consumer's `ref` passes through untouched.
 */
function usePointerTransform<T extends HTMLElement>({
  compute,
  enabled,
  keepTransform,
}: PointerTransformOptions): {
  handlePointerLeave: (event: React.PointerEvent<T>) => void;
  handlePointerMove: (event: React.PointerEvent<T>) => void;
} {
  const element = React.useRef<null | T>(null);
  const pointer = React.useRef<Point>({ x: 0, y: 0 });
  const frame = React.useRef<null | number>(null);

  React.useEffect(() => {
    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      element.current = null;
    };
  }, []);

  const writeTransform = (target: null | T, transform: string): void => {
    if (target && !keepTransform) {
      target.style.transform = transform;
    }
  };

  const applyFrame = (): void => {
    frame.current = null;
    const target = element.current;
    if (target) {
      writeTransform(
        target,
        compute(pointer.current, target.getBoundingClientRect()),
      );
    }
  };

  return {
    handlePointerLeave: (event) => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      writeTransform(event.currentTarget, "");
    },
    handlePointerMove: (event) => {
      if (!enabled) {
        return;
      }
      element.current = event.currentTarget;
      pointer.current = { x: event.clientX, y: event.clientY };
      frame.current ??= requestAnimationFrame(applyFrame);
    },
  };
}

/**
 * Wrapper that drifts its content toward the pointer, then snaps back.
 *
 * Respects `prefers-reduced-motion`: the content stays put.
 *
 * @example
 * ```tsx
 * <Magnetic><img src="/logo.svg" alt="logo" /></Magnetic>
 * ```
 */
export const Magnetic = ({
  children,
  className,
  ref,
  strength = 0.4,
  style,
  ...props
}: MagneticProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const reduced = usePrefersReducedMotion();
  const { handlePointerLeave, handlePointerMove } =
    usePointerTransform<HTMLDivElement>({
      compute: (pointer, bounds) => {
        const offsetX = (pointer.x - bounds.left - bounds.width / 2) * strength;
        const offsetY = (pointer.y - bounds.top - bounds.height / 2) * strength;
        return `translate(${offsetX}px, ${offsetY}px)`;
      },
      enabled: !reduced,
      keepTransform: style?.transform !== undefined,
    });

  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out will-change-transform",
        className,
      )}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={ref}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
Magnetic.displayName = "Magnetic";
