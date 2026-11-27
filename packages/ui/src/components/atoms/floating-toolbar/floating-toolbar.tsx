"use client";

import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";

import type { MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import { moveRovingFocus } from "../../../lib/roving-focus";
import { cn } from "../../../lib/utils";

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

const ACTION_SELECTOR = "button[data-action-id]";

function resolveTabStopId(
  actions: FloatingToolbarAction[],
  focusedId: string | undefined,
): string | undefined {
  const enabledIds = actions
    .filter((action) => !action.disabled)
    .map((action) => action.id);
  return focusedId !== undefined && enabledIds.includes(focusedId)
    ? focusedId
    : enabledIds[0];
}

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
} & MaterialProps &
  Omit<ComponentPropsWithoutRef<"div">, "style">;

/**
 * Compact action bar that floats above a selection. Pair with
 * {@link SelectionHalo} — surface the toolbar at the halo's top edge so
 * the user sees the available actions for the current selection.
 *
 * Keyboard: the toolbar is one tab stop. Left and Right Arrow move between
 * actions and wrap at the ends, Home and End jump to the first and last
 * action, and the toolbar passes over disabled actions.
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
export const FloatingToolbar = /* @__PURE__ */ named(
  "FloatingToolbar",
  ({
    material = "glass",
    ref,
    ...props
  }: FloatingToolbarProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const { actions, className, labels, onKeyDown, x, y, ...rest } = props;
    const [focusedId, setFocusedId] = useState<string | undefined>();
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const tabStopId = resolveTabStopId(actions, focusedId);
    const handleKeyDownToolbar = (
      event: KeyboardEvent<HTMLDivElement>,
    ): void => {
      onKeyDown?.(event);
      moveRovingFocus(event, ACTION_SELECTOR);
    };
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn(
          "vllnt-glass-floating absolute z-30 flex -translate-y-full items-center gap-1 rounded-md border p-1",
          className,
        )}
        data-floating-toolbar
        data-material={material}
        ref={ref}
        role="toolbar"
        style={{ left: `${x.toString()}px`, top: `${y.toString()}px` }}
        {...rest}
        onKeyDown={handleKeyDownToolbar}
      >
        {actions.map((action) => {
          const variant = action.variant ?? "ghost";
          const handleActivateToolbarAction = (): void => {
            action.onActivate();
          };
          const handleFocusToolbarAction = (): void => {
            setFocusedId(action.id);
          };
          return (
            <button
              aria-label={action.ariaLabel ?? undefined}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                VARIANT_CLASSES[variant],
                action.disabled ? "cursor-not-allowed opacity-50" : "",
              )}
              data-action-id={action.id}
              data-variant={variant}
              disabled={action.disabled}
              key={action.id}
              onClick={handleActivateToolbarAction}
              onFocus={handleFocusToolbarAction}
              tabIndex={action.id === tabStopId ? 0 : -1}
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
  },
);
