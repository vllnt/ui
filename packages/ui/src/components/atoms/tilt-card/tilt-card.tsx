"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

/** Props for {@link TiltCard}. */
export type TiltCardProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Peak rotation in degrees applied at the card edges. Defaults to `12`. */
  maxTilt?: number;
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

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, -max), max);
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
 * Card that tilts in 3D toward the pointer for a parallax hover effect.
 *
 * Respects `prefers-reduced-motion`: the card stays flat.
 *
 * @example
 * ```tsx
 * <TiltCard className="rounded-xl border bg-card p-6">Hover me</TiltCard>
 * ```
 */
export const TiltCard = ({
  children,
  className,
  maxTilt = 12,
  ref,
  style,
  ...props
}: TiltCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const reduced = usePrefersReducedMotion();
  const { handlePointerLeave, handlePointerMove, setReferences } =
    usePointerTransform<HTMLDivElement>({
      compute: (pointer, bounds) => {
        const offsetX = (pointer.x - bounds.left) / bounds.width - 0.5;
        const offsetY = (pointer.y - bounds.top) / bounds.height - 0.5;
        const rotateY = clamp(offsetX * maxTilt * 2, maxTilt);
        const rotateX = clamp(-offsetY * maxTilt * 2, maxTilt);
        return `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      },
      enabled: !reduced,
      keepTransform: style?.transform !== undefined,
      ref,
    });

  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out will-change-transform",
        className,
      )}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={setReferences}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
TiltCard.displayName = "TiltCard";
