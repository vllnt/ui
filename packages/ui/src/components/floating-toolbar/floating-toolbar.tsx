"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * One toolbar action.
 *
 * @public
 */
export type FloatingToolbarAction = {
  /** Optional aria-label override (defaults to the visible label). */
  ariaLabel?: string;
  /** When `true`, renders dimmed and ignores clicks. */
  disabled?: boolean;
  /** Optional leading glyph. */
  glyph?: ReactNode;
  /** Stable identifier. */
  id: string;
  /** Visible label. */
  label: ReactNode;
  /** Click handler. */
  onActivate: () => void;
  /** Optional emphasis level. Defaults to `"ghost"`. */
  variant?: "destructive" | "ghost" | "primary";
};

const VARIANT_CLASSES: Record<
  NonNullable<FloatingToolbarAction["variant"]>,
  string
> = {
  destructive:
    "border-red-300 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300",
  ghost: "border-border bg-background text-foreground hover:bg-accent",
  primary:
    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type FloatingToolbarLabels = {
  /** Aria-label for the toolbar. Defaults to `"Selection actions"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Selection actions",
} as const satisfies Required<FloatingToolbarLabels>;

/**
 * Props for {@link FloatingToolbar}.
 *
 * @public
 */
export type FloatingToolbarProps = {
  /** Toolbar actions in render order. */
  actions: FloatingToolbarAction[];
  /** Localizable strings. */
  labels?: FloatingToolbarLabels;
  /** X coordinate in container px (left edge of the toolbar). */
  x: number;
  /** Y coordinate in container px (bottom edge of the toolbar — the bar floats above this point). */
  y: number;
} & Omit<ComponentPropsWithoutRef<"div">, "style">;

/**
 * Compact action bar that floats above a selection. Pair with
 * {@link SelectionHalo} — surface the toolbar at the halo's top edge so
 * the user sees the available actions for the current selection.
 *
 * @example
 * ```tsx
 * <FloatingToolbar
 *   x={120}
 *   y={80}
 *   actions={[
 *     { id: "rename", label: "Rename", onActivate: rename, variant: "primary" },
 *     { id: "duplicate", label: "Duplicate", onActivate: duplicate },
 *     { id: "delete", label: "Delete", onActivate: remove, variant: "destructive" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const FloatingToolbar = (
  props: FloatingToolbarProps & React.RefAttributes<HTMLDivElement>,
) => {
  const { actions, className, labels, ref, x, y, ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <div
      aria-label={resolvedLabels.region}
      className={cn(
        "absolute z-30 flex -translate-y-full items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-md backdrop-blur",
        className,
      )}
      data-floating-toolbar
      ref={ref}
      role="toolbar"
      style={{ left: `${x.toString()}px`, top: `${y.toString()}px` }}
      {...rest}
    >
      {actions.map((action) => {
        const variant = action.variant ?? "ghost";
        const handleClick = (): void => {
          action.onActivate();
        };
        return (
          <button
            aria-label={action.ariaLabel ?? undefined}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              VARIANT_CLASSES[variant],
              action.disabled ? "cursor-not-allowed opacity-50" : "",
            )}
            data-action-id={action.id}
            data-variant={variant}
            disabled={action.disabled}
            key={action.id}
            onClick={handleClick}
            type="button"
          >
            {action.glyph ? (
              <span aria-hidden="true" className="inline-flex size-3">
                {action.glyph}
              </span>
            ) : null}
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};
FloatingToolbar.displayName = "FloatingToolbar";
