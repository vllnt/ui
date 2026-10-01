"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

/** Props for {@link MagneticButton}. */
export type MagneticButtonProps = React.ComponentPropsWithoutRef<"button"> & {
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

type PointerTransformOptions<T extends HTMLElement> = {
  /** Builds the `transform` for the latest pointer position. */
  compute: (pointer: Point, bounds: DOMRect) => string;
  /** False under reduced motion, which makes the hook skip pointer moves. */
  enabled: boolean;
  /** True when the consumer passed `style.transform`, which always wins. */
  keepTransform: boolean;
  ref?: React.Ref<T>;
};

/**
 * Applies a pointer-driven `transform` at most once per animation frame by
 * writing the element's style directly, so pointer moves never re-render.
 * Leaving the element clears the transform.
 */
function usePointerTransform<T extends HTMLElement>({
  compute,
  enabled,
  keepTransform,
  ref,
}: PointerTransformOptions<T>): {
  handlePointerLeave: () => void;
  handlePointerMove: (event: React.PointerEvent<T>) => void;
  setReferences: (node: null | T) => void;
} {
  const element = React.useRef<null | T>(null);
  const pointer = React.useRef<Point>({ x: 0, y: 0 });
  const frame = React.useRef<null | number>(null);

  React.useEffect(() => {
    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, []);

  const setReferences = React.useCallback(
    (node: null | T): void => {
      element.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const writeTransform = (transform: string): void => {
    if (element.current && !keepTransform) {
      element.current.style.transform = transform;
    }
  };

  const applyFrame = (): void => {
    frame.current = null;
    if (element.current) {
      writeTransform(
        compute(pointer.current, element.current.getBoundingClientRect()),
      );
    }
  };

  return {
    handlePointerLeave: () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      writeTransform("");
    },
    handlePointerMove: (event) => {
      if (!enabled) {
        return;
      }
      pointer.current = { x: event.clientX, y: event.clientY };
      frame.current ??= requestAnimationFrame(applyFrame);
    },
    setReferences,
  };
}

/**
 * Button that drifts toward the pointer while hovered, then snaps back.
 *
 * Respects `prefers-reduced-motion`: the button stays put.
 *
 * @example
 * ```tsx
 * <MagneticButton>Hover me</MagneticButton>
 * ```
 */
export const MagneticButton = ({
  children,
  className,
  ref,
  strength = 0.4,
  style,
  ...props
}: MagneticButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const reduced = usePrefersReducedMotion();
  const { handlePointerLeave, handlePointerMove, setReferences } =
    usePointerTransform<HTMLButtonElement>({
      compute: (pointer, bounds) => {
        const offsetX = (pointer.x - bounds.left - bounds.width / 2) * strength;
        const offsetY = (pointer.y - bounds.top - bounds.height / 2) * strength;
        return `translate(${offsetX}px, ${offsetY}px)`;
      },
      enabled: !reduced,
      keepTransform: style?.transform !== undefined,
      ref,
    });

  return (
    <button
      className={cn(
        "transition-transform duration-200 ease-out will-change-transform",
        className,
      )}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={setReferences}
      style={style}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};
MagneticButton.displayName = "MagneticButton";
