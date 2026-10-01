"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

/** Props for {@link Dock}. */
export type DockProps = React.ComponentPropsWithoutRef<"div">;

/** Props for {@link DockIcon}. */
export type DockIconProps = React.ComponentPropsWithoutRef<"div">;

type DockMagnifier = {
  /** Adds an icon to the magnified set; the returned function removes it. */
  register: (icon: HTMLDivElement) => () => void;
};

const DockMagnifierContext = React.createContext<DockMagnifier | null>(null);

function assignRef(
  ref: React.Ref<HTMLDivElement> | undefined,
  node: HTMLDivElement | null,
): void {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
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

function iconScale(icon: HTMLDivElement, pointerX: null | number): number {
  if (pointerX === null) {
    return 1;
  }

  const bounds = icon.getBoundingClientRect();
  return magnify(pointerX - (bounds.left + bounds.width / 2));
}

/**
 * Tracks the pointer in a ref and rescales the registered icons at most once
 * per animation frame, writing `transform` directly instead of re-rendering.
 * Every bounds read in a frame happens before any style write.
 */
function useDockMagnifier(): {
  magnifier: DockMagnifier;
  trackPointer: (pointerX: null | number) => void;
} {
  const reduced = usePrefersReducedMotion();
  const [icons] = React.useState(() => new Set<HTMLDivElement>());
  const pointerX = React.useRef<null | number>(null);
  const reducedReference = React.useRef(reduced);
  const frame = React.useRef<null | number>(null);

  const scheduleUpdate = React.useCallback((): void => {
    if (frame.current !== null) {
      return;
    }

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const x = reducedReference.current ? null : pointerX.current;
      const targets = [...icons];
      const scales = targets.map((icon) => iconScale(icon, x));
      targets.forEach((icon, index) => {
        icon.style.transform = `scale(${scales[index] ?? 1})`;
      });
    });
  }, [icons]);

  React.useEffect(() => {
    reducedReference.current = reduced;
    scheduleUpdate();
  }, [reduced, scheduleUpdate]);

  React.useEffect(() => {
    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, []);

  const magnifier = React.useMemo<DockMagnifier>(
    () => ({
      register: (icon) => {
        icons.add(icon);
        scheduleUpdate();
        return () => {
          icons.delete(icon);
        };
      },
    }),
    [icons, scheduleUpdate],
  );

  const trackPointer = React.useCallback(
    (nextPointerX: null | number): void => {
      pointerX.current = nextPointerX;
      scheduleUpdate();
    },
    [scheduleUpdate],
  );

  return { magnifier, trackPointer };
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
export const Dock = ({
  children,
  className,
  ref,
  ...props
}: DockProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { magnifier, trackPointer } = useDockMagnifier();

  return (
    <DockMagnifierContext.Provider value={magnifier}>
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-card/60 p-2 backdrop-blur",
          className,
        )}
        onPointerLeave={() => {
          trackPointer(null);
        }}
        onPointerMove={(event) => {
          trackPointer(event.clientX);
        }}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </DockMagnifierContext.Provider>
  );
};
Dock.displayName = "Dock";

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
export const DockIcon = ({
  children,
  className,
  ref,
  style,
  ...props
}: DockIconProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const magnifier = React.use(DockMagnifierContext);
  const reference = React.useRef<HTMLDivElement>(null);
  const hasCustomTransform = style?.transform !== undefined;

  React.useEffect(() => {
    const icon = reference.current;
    if (!magnifier || !icon || hasCustomTransform) {
      return;
    }
    return magnifier.register(icon);
  }, [hasCustomTransform, magnifier]);

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
      style={{ transform: "scale(1)", ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
DockIcon.displayName = "DockIcon";
