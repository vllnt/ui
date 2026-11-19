import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/utils";

const scrimVariants = cva("absolute inset-0", {
  defaultVariants: {
    level: "dim",
  },
  variants: {
    level: {
      dim: "bg-black/50",
      strong: "bg-black/80",
    },
  },
});

/** Opacity level of a {@link Scrim}: `dim` is a light veil, `strong` hides what is behind it. */
export type ScrimLevel = NonNullable<
  VariantProps<typeof scrimVariants>["level"]
>;

/** Props for {@link Scrim}. */
export type ScrimProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Opacity level of the black overlay, the same in every theme mode. Defaults to `"dim"`. */
  level?: ScrimLevel;
};

/**
 * Flat full-bleed overlay that dims the surface behind a panel, sheet or pane.
 * Decorative: screen readers skip it. It fills its nearest positioned
 * ancestor; pass `className="fixed"` to cover the viewport.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <Content />
 *   <Scrim level="strong" />
 * </div>
 * ```
 */
export const Scrim = ({
  className,
  level,
  ref,
  ...props
}: ScrimProps & { ref?: React.Ref<HTMLDivElement> }): React.JSX.Element => (
  <div
    aria-hidden="true"
    className={cn(scrimVariants({ level }), className)}
    ref={ref}
    {...props}
  />
);
Scrim.displayName = "Scrim";
