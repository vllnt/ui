import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";

/** Props for the {@link Separator} component. */
export type SeparatorProps = {
  /**
   * Purely visual line. Hides it from assistive tech (`aria-hidden`); set
   * `false` to expose `role="separator"` with `aria-orientation`.
   * @default true
   */
  decorative?: boolean;
  /**
   * Direction of the line.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  ref?: React.Ref<HTMLDivElement>;
  /**
   * `solid` draws a filled 1 px line. `dashed` draws a 1 px dashed border over
   * a transparent fill, in both orientations.
   * @default "solid"
   */
  variant?: "dashed" | "solid";
} & React.HTMLAttributes<HTMLDivElement>;

const LINE_CLASSES = {
  dashed: {
    horizontal: "h-0 w-full border-t border-dashed border-border",
    vertical: "h-full w-0 border-l border-dashed border-border",
  },
  solid: {
    horizontal: "h-[1px] w-full bg-border",
    vertical: "h-full w-[1px] bg-border",
  },
} as const;

/**
 * Divider line between content sections. It holds no state, so it renders on
 * the server (no `"use client"`).
 * @example
 * <Separator />
 * <Separator variant="dashed" />
 * <Separator decorative={false} orientation="vertical" />
 */
const Separator = /* @__PURE__ */ named(
  "Separator",
  ({
    className,
    decorative = true,
    orientation = "horizontal",
    ref,
    variant = "solid",
    ...props
  }: SeparatorProps) => (
    <div
      className={cn("shrink-0", LINE_CLASSES[variant][orientation], className)}
      data-orientation={orientation}
      ref={ref}
      {...(decorative
        ? { "aria-hidden": true }
        : { "aria-orientation": orientation, role: "separator" })}
      {...props}
    />
  ),
);

export { Separator };
