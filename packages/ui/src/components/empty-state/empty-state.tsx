import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center gap-3 text-center text-foreground",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "px-6 py-16",
        md: "px-4 py-10",
        sm: "px-3 py-6",
      },
    },
  },
);

const titleVariants = cva("font-semibold tracking-tight", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "text-xl",
      md: "text-lg",
      sm: "text-base",
    },
  },
});

const descriptionVariants = cva("max-w-prose text-muted-foreground", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "text-base",
      md: "text-sm",
      sm: "text-xs",
    },
  },
});

const iconVariants = cva(
  "mb-1 flex items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:h-1/2 [&_svg]:w-1/2",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "size-16",
        md: "size-12",
        sm: "size-8",
      },
    },
  },
);

/**
 * Visual size for {@link EmptyState}.
 *
 * - `sm` — inline, suitable for compact lists or cards
 * - `md` — section-level (default)
 * - `lg` — full-page placeholder
 *
 * @public
 */
export type EmptyStateSize = "lg" | "md" | "sm";

/**
 * Props for {@link EmptyState}.
 *
 * @public
 */
export type EmptyStateProps = {
  /**
   * Action slot rendered below the description. Compose with `Button` or any
   * interactive element.
   */
  children?: ReactNode;
  /** Optional secondary text describing the empty condition. */
  description?: ReactNode;
  /** Optional icon or illustration shown above the title. */
  icon?: ReactNode;
  /** Headline rendered as a heading element. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof emptyStateVariants>;

/**
 * Placeholder for empty lists, tables, and search results. Composes a
 * centered icon, title, description, and an action slot. Announces itself
 * via `role="status"` so assistive tech can pick up state changes
 * (e.g. when filters clear results).
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Inbox />}
 *   title="No results found"
 *   description="Try adjusting your search or filters."
 * >
 *   <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
 * </EmptyState>
 * ```
 *
 * @public
 */
export const EmptyState = ({
  children,
  className,
  description,
  icon,
  ref,
  role: roleOverride,
  size,
  title,
  ...rest
}: EmptyStateProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(emptyStateVariants({ size }), className)}
      ref={ref}
      role={roleOverride ?? "status"}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className={cn(iconVariants({ size }))}>
          {icon}
        </span>
      ) : null}
      {title ? <h3 className={cn(titleVariants({ size }))}>{title}</h3> : null}
      {description ? (
        <p className={cn(descriptionVariants({ size }))}>{description}</p>
      ) : null}
      {children ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
};
EmptyState.displayName = "EmptyState";

export { emptyStateVariants };
