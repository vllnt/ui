"use client";

import {
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  type Ref,
  useContext,
  useMemo,
} from "react";

import { cn } from "../../lib/utils";

function assignRef<T>(ref: Ref<T> | undefined, node: null | T): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

/**
 * Color theme for an {@link EraColumn} accent strip.
 *
 * @public
 */
export type EraColor =
  | "amber"
  | "blue"
  | "emerald"
  | "neutral"
  | "purple"
  | "red"
  | "rose";

const ERA_PALETTE: Record<EraColor, { accent: string; chip: string }> = {
  amber: {
    accent: "bg-amber-500",
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  blue: {
    accent: "bg-blue-500",
    chip: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  emerald: {
    accent: "bg-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  neutral: {
    accent: "bg-muted-foreground/40",
    chip: "bg-muted text-muted-foreground",
  },
  purple: {
    accent: "bg-purple-500",
    chip: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  },
  red: {
    accent: "bg-red-500",
    chip: "bg-red-500/15 text-red-700 dark:text-red-300",
  },
  rose: {
    accent: "bg-rose-500",
    chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
};

type EraColumnContextValue = {
  color: EraColor;
};

const EraColumnContext = createContext<EraColumnContextValue>({
  color: "neutral",
});

/**
 * Hook for reading the surrounding {@link EraColumn}'s color theme. Useful
 * for custom children that want to match the column accent.
 *
 * @public
 */
export function useEraColumnColor(): EraColor {
  return useContext(EraColumnContext).color;
}

/**
 * Props for {@link EraComparison}.
 *
 * @public
 */
export type EraComparisonProps = ComponentPropsWithoutRef<"section">;

/**
 * Side-by-side comparison of historical eras. Lays out {@link EraColumn}
 * children in a responsive grid (1 col on mobile → 2 col on `md` → 3 col
 * on `xl`). Composes {@link Badge}.
 *
 * @example
 * ```tsx
 * <EraComparison>
 *   <EraColumn name="Renaissance" period="1400–1600" color="amber">
 *     <EraDomain name="Art">
 *       <EraHighlight>Perspective painting, humanism</EraHighlight>
 *       <EraFigure name="Leonardo da Vinci" />
 *     </EraDomain>
 *   </EraColumn>
 *   <EraColumn name="Islamic Golden Age" period="800–1400" color="emerald">
 *     <EraDomain name="Science">
 *       <EraHighlight>Algebra, optics, astronomy</EraHighlight>
 *       <EraFigure name="Al-Khwarizmi" />
 *     </EraDomain>
 *   </EraColumn>
 * </EraComparison>
 * ```
 *
 * @public
 */
export const EraComparison = forwardRef<HTMLElement, EraComparisonProps>(
  ({ children, className, ...rest }, ref) => (
    <section
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </section>
  ),
);
EraComparison.displayName = "EraComparison";

/**
 * Props for {@link EraColumn}.
 *
 * @public
 */
export type EraColumnProps = {
  /** Color theme. Drives the top accent strip + chip. Defaults to `"neutral"`. */
  color?: EraColor;
  /** Era display name. */
  name: ReactNode;
  /** Period label (e.g. `"1400–1600"`). */
  period?: ReactNode;
  /** Optional region label (e.g. `"Europe"`). */
  region?: ReactNode;
} & ComponentPropsWithoutRef<"article">;

type ColumnHeaderProps = {
  color: EraColor;
  name: ReactNode;
  period?: ReactNode;
  region?: ReactNode;
};

function ColumnHeader({
  color,
  name,
  period,
  region,
}: ColumnHeaderProps): ReactNode {
  const palette = ERA_PALETTE[color];
  return (
    <header className="flex flex-col gap-2">
      <span
        aria-hidden="true"
        className={cn("h-1 w-12 rounded-full", palette.accent)}
      />
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {name}
        </h3>
        {period ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-mono",
              palette.chip,
            )}
          >
            {period}
          </span>
        ) : null}
      </div>
      {region ? (
        <p className="text-xs text-muted-foreground">{region}</p>
      ) : null}
    </header>
  );
}

/**
 * Single era column inside an {@link EraComparison}. Wraps a header (name,
 * period, region) and the column body — typically a series of
 * {@link EraDomain} sections.
 *
 * @public
 */
export const EraColumn = forwardRef<HTMLElement, EraColumnProps>(
  (props, ref) => {
    const {
      children,
      className,
      color = "neutral",
      name,
      period,
      region,
      ...rest
    } = props;
    const contextValue = useMemo<EraColumnContextValue>(
      () => ({ color }),
      [color],
    );
    return (
      <EraColumnContext.Provider value={contextValue}>
        <article
          className={cn(
            "flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm",
            className,
          )}
          data-color={color}
          ref={ref}
          {...rest}
        >
          <ColumnHeader
            color={color}
            name={name}
            period={period}
            region={region}
          />
          <div className="flex flex-col gap-3">{children}</div>
        </article>
      </EraColumnContext.Provider>
    );
  },
);
EraColumn.displayName = "EraColumn";

/**
 * Props for {@link EraDomain}.
 *
 * @public
 */
export type EraDomainProps = {
  /** Domain display name (e.g. `"Art"`, `"Science"`). */
  name: ReactNode;
} & ComponentPropsWithoutRef<"section">;

/**
 * Domain row inside an {@link EraColumn}. Aligns across columns by
 * convention — pass the same `name` in each column for parallel rows.
 *
 * @public
 */
export const EraDomain = forwardRef<HTMLElement, EraDomainProps>(
  ({ children, className, name, ...rest }, ref) => (
    <section
      className={cn("flex flex-col gap-2", className)}
      data-domain={typeof name === "string" ? name : undefined}
      ref={ref}
      {...rest}
    >
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {name}
      </h4>
      {children}
    </section>
  ),
);
EraDomain.displayName = "EraDomain";

/**
 * Props for {@link EraHighlight}.
 *
 * @public
 */
export type EraHighlightProps = ComponentPropsWithoutRef<"p">;

/**
 * Single-line achievement note inside an {@link EraDomain}. Picks up the
 * surrounding column's color theme automatically.
 *
 * @public
 */
export const EraHighlight = forwardRef<HTMLParagraphElement, EraHighlightProps>(
  ({ children, className, ...rest }, ref) => {
    const color = useEraColumnColor();
    const palette = ERA_PALETTE[color];
    return (
      <p
        className={cn("rounded-md px-2 py-1 text-sm", palette.chip, className)}
        ref={ref}
        {...rest}
      >
        {children}
      </p>
    );
  },
);
EraHighlight.displayName = "EraHighlight";

type AnchorPassthroughProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
>;

/**
 * Props for {@link EraFigure}.
 *
 * @public
 */
export type EraFigureProps = {
  /** Anchor passthrough (e.g. `target`, `rel`). Forwarded with `href`. */
  anchorProps?: AnchorPassthroughProps;
  /** Optional anchor href. With this prop the chip renders as an `<a>`. */
  href?: string;
  /** Display name for the figure. */
  name: ReactNode;
} & Omit<ComponentPropsWithoutRef<"span">, "children">;

/**
 * Pill-shaped reference to a notable figure. With an `href`, the chip
 * renders as a link.
 *
 * @public
 */
export const EraFigure = forwardRef<
  HTMLAnchorElement | HTMLSpanElement,
  EraFigureProps
>((props, ref) => {
  const { anchorProps, className, href, name, ...rest } = props;
  const color = useEraColumnColor();
  const palette = ERA_PALETTE[color];
  const baseClass = cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    palette.chip,
    className,
  );
  if (href) {
    return (
      <a
        className={cn(baseClass, "underline-offset-4 hover:underline")}
        href={href}
        ref={(node) => {
          assignRef(ref, node);
        }}
        {...anchorProps}
      >
        {name}
      </a>
    );
  }
  return (
    <span
      className={baseClass}
      ref={(node) => {
        assignRef(ref, node);
      }}
      {...rest}
    >
      {name}
    </span>
  );
});
EraFigure.displayName = "EraFigure";
