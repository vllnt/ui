import { cx } from "../../../lib/cx";
import { named } from "../../../lib/named";

import type { SeparatorProps } from "./separator";

// The same classes as `Separator`, copied because a registry shim ships
// one file per component; the PlainSeparator tests compare both renders.
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

/** Props for the {@link PlainSeparator} component: the same as `Separator`. */
export type PlainSeparatorProps = SeparatorProps;

/**
 * `Separator` without `tailwind-merge`: the same line, orientation, variant
 * and roles, with classes joined by `cx`. A `className` that conflicts with a
 * default (for example a `bg-*` or `h-*`) does not replace it, so add classes
 * that do not conflict, such as margins. It holds no state, so it renders on
 * the server (no `"use client"`).
 * @example
 * <PlainSeparator className="my-4" />
 */
const PlainSeparator = /* @__PURE__ */ named(
  "PlainSeparator",
  ({
    className,
    decorative = true,
    orientation = "horizontal",
    ref,
    variant = "solid",
    ...props
  }: PlainSeparatorProps) => (
    <div
      className={cx("shrink-0", LINE_CLASSES[variant][orientation], className)}
      data-orientation={orientation}
      ref={ref}
      {...(decorative
        ? { "aria-hidden": true }
        : { "aria-orientation": orientation, role: "separator" })}
      {...props}
    />
  ),
);

export { PlainSeparator };
