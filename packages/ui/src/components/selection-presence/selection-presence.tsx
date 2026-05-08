"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Color theme for the selection halo + name chip.
 *
 * @public
 */
export type SelectionPresenceColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const PALETTE: Record<SelectionPresenceColor, { chip: string; ring: string }> =
  {
    amber: { chip: "bg-amber-500 text-white", ring: "ring-amber-500" },
    blue: { chip: "bg-blue-500 text-white", ring: "ring-blue-500" },
    emerald: { chip: "bg-emerald-500 text-white", ring: "ring-emerald-500" },
    purple: { chip: "bg-purple-500 text-white", ring: "ring-purple-500" },
    red: { chip: "bg-red-500 text-white", ring: "ring-red-500" },
    rose: { chip: "bg-rose-500 text-white", ring: "ring-rose-500" },
  };

/**
 * Props for {@link SelectionPresence}.
 *
 * @public
 */
export type SelectionPresenceProps = {
  /** Color theme. Defaults to `"blue"`. */
  color?: SelectionPresenceColor;
  /** Optional name chip rendered above the top-left corner. */
  name?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "color">;

/**
 * Selection halo for a remote participant. Wrap any selected element to
 * outline it with the participant's color and surface a name chip above
 * the corner. Pure presentation — the host controls visibility (mount
 * when remote selection exists, unmount when cleared).
 *
 * @example
 * ```tsx
 * <SelectionPresence color="emerald" name="Sam">
 *   <ObjectCard … />
 * </SelectionPresence>
 * ```
 *
 * @public
 */
export const SelectionPresence = forwardRef<
  HTMLDivElement,
  SelectionPresenceProps
>((props, ref) => {
  const { children, className, color = "blue", name, ...rest } = props;
  const palette = PALETTE[color];
  return (
    <div
      className={cn(
        "relative rounded-2xl ring-2 ring-offset-2 ring-offset-background",
        palette.ring,
        className,
      )}
      data-selection-color={color}
      ref={ref}
      {...rest}
    >
      {name ? (
        <span
          className={cn(
            "absolute -top-2 left-2 inline-flex -translate-y-full items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold shadow-sm",
            palette.chip,
          )}
          data-selection-chip
        >
          {name}
        </span>
      ) : null}
      {children}
    </div>
  );
});
SelectionPresence.displayName = "SelectionPresence";
