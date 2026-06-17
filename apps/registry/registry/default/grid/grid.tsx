import { forwardRef } from "react";

import { cn } from "@vllnt/ui";

/** Number of columns the grid resolves to at a given breakpoint. */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Spacing scale (Tailwind gap units) between grid cells. */
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

const colsClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
};

const smColsClasses: Record<GridColumns, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  7: "sm:grid-cols-7",
  8: "sm:grid-cols-8",
  9: "sm:grid-cols-9",
  10: "sm:grid-cols-10",
  11: "sm:grid-cols-11",
  12: "sm:grid-cols-12",
};

const mdColsClasses: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12",
};

const lgColsClasses: Record<GridColumns, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
  9: "lg:grid-cols-9",
  10: "lg:grid-cols-10",
  11: "lg:grid-cols-11",
  12: "lg:grid-cols-12",
};

const gapClasses: Record<GridGap, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

/** Props for the {@link Grid} layout primitive. */
export type GridProps = {
  /** Base column count (all breakpoints). Defaults to `1`. */
  cols?: GridColumns;
  /** Gap between cells. Defaults to `4`. */
  gap?: GridGap;
  /** Column count at the `lg` breakpoint and up. */
  lgCols?: GridColumns;
  /** Column count at the `md` breakpoint and up. */
  mdCols?: GridColumns;
  /** Column count at the `sm` breakpoint and up. */
  smCols?: GridColumns;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Responsive CSS grid layout primitive. Column counts map to Tailwind
 * `grid-cols-*` utilities per breakpoint.
 * @example
 * <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
 *   <Card />
 *   <Card />
 * </Grid>
 */
const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 4, lgCols, mdCols, smCols, ...props }, ref) => (
    <div
      className={cn(
        "grid",
        colsClasses[cols],
        smCols !== undefined && smColsClasses[smCols],
        mdCols !== undefined && mdColsClasses[mdCols],
        lgCols !== undefined && lgColsClasses[lgCols],
        gapClasses[gap],
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Grid.displayName = "Grid";

export { Grid };
