"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link Dock}. */
export type DockProps = React.ComponentPropsWithoutRef<"div">;

/** Props for {@link DockIcon}. */
export type DockIconProps = React.ComponentPropsWithoutRef<"div">;

const DockPointerContext = React.createContext<null | number>(null);

function assignRef(
  ref: React.ForwardedRef<HTMLDivElement>,
  node: HTMLDivElement | null,
): void {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref !== null) {
    ref.current = node;
  }
}

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

function magnify(distance: number): number {
  const range = 100;
  const clamped = Math.min(Math.abs(distance), range);
  return 1 + 0.5 * (1 - clamped / range);
}

/**
 * macOS-style dock that magnifies its {@link DockIcon} children near the pointer.
 *
 * @example
 * ```tsx
 * <Dock>
 *   <DockIcon>A</DockIcon>
 *   <DockIcon>B</DockIcon>
 * </Dock>
 * ```
 */
export const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ children, className, ...props }, ref) => {
    const [pointerX, setPointerX] = React.useState<null | number>(null);

    return (
      <DockPointerContext.Provider value={pointerX}>
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-card/60 p-2 backdrop-blur",
            className,
          )}
          onPointerLeave={() => {
            setPointerX(null);
          }}
          onPointerMove={(event) => {
            setPointerX(event.clientX);
          }}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </DockPointerContext.Provider>
    );
  },
);
Dock.displayName = "Dock";

function useDockScale(
  reference: React.RefObject<HTMLDivElement | null>,
  pointerX: null | number,
  reduced: boolean,
): number {
  if (reduced || pointerX === null || reference.current === null) {
    return 1;
  }

  const bounds = reference.current.getBoundingClientRect();
  const center = bounds.left + bounds.width / 2;
  return magnify(pointerX - center);
}

/**
 * Single dock entry that scales up as the pointer moves toward its center.
 *
 * Respects `prefers-reduced-motion`: the icon stays at rest size.
 *
 * @example
 * ```tsx
 * <DockIcon>Home</DockIcon>
 * ```
 */
export const DockIcon = React.forwardRef<HTMLDivElement, DockIconProps>(
  ({ children, className, style, ...props }, ref) => {
    const pointerX = React.useContext(DockPointerContext);
    const reduced = usePrefersReducedMotion();
    const reference = React.useRef<HTMLDivElement>(null);
    const scale = useDockScale(reference, pointerX, reduced);

    const setReferences = React.useCallback(
      (node: HTMLDivElement | null): void => {
        reference.current = node;
        assignRef(ref, node);
      },
      [ref],
    );

    return (
      <div
        className={cn(
          "flex aspect-square w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform",
          className,
        )}
        ref={setReferences}
        style={{ transform: `scale(${scale})`, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
DockIcon.displayName = "DockIcon";
