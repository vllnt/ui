import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link BentoGrid}. */
export type BentoGridProps = React.ComponentPropsWithoutRef<"div">;

/** Props for {@link BentoCard}. */
export type BentoCardProps = React.ComponentPropsWithoutRef<"div">;

/**
 * Responsive masonry-style grid that lays out {@link BentoCard} tiles.
 *
 * @example
 * ```tsx
 * <BentoGrid>
 *   <BentoCard className="col-span-2">Featured</BentoCard>
 *   <BentoCard>Detail</BentoCard>
 * </BentoGrid>
 * ```
 */
export const BentoGrid = ({
  children,
  className,
  ref,
  ...props
}: BentoGridProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[14rem] grid-cols-3 gap-4",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
};
BentoGrid.displayName = "BentoGrid";

/**
 * Single tile inside a {@link BentoGrid} with a hover shadow lift.
 *
 * @example
 * ```tsx
 * <BentoCard className="col-span-2 row-span-2">Highlight</BentoCard>
 * ```
 */
export const BentoCard = ({
  children,
  className,
  ref,
  ...props
}: BentoCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
};
BentoCard.displayName = "BentoCard";
