import { cva } from "class-variance-authority";
import Link from "next/link";
import type * as React from "react";

import { cn } from "../../../lib/utils";

/**
 * One crumb of a {@link Breadcrumb} trail.
 *
 * @public
 */
export type BreadcrumbItem = {
  /** Link target. Ignored on the last item, which is the current page. */
  href?: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
};

/**
 * Localizable strings for {@link Breadcrumb}.
 *
 * @public
 */
export type BreadcrumbLabels = {
  /** Screen-reader word for the collapsed crumbs. Defaults to `"More"`. */
  more?: string;
  /** Accessible name of the `<nav>` landmark. Defaults to `"Breadcrumb"`. */
  region?: string;
};

/**
 * Props for {@link Breadcrumb}.
 *
 * @public
 */
export type BreadcrumbProps = {
  className?: string;
  items: BreadcrumbItem[];
  /** Localizable strings. */
  labels?: BreadcrumbLabels;
  /** Link component (e.g., Next.js Link). Defaults to `next/link`. */
  linkComponent?: React.ComponentType<{
    children: React.ReactNode;
    className?: string;
    href: string;
  }>;
  /**
   * `"collapsed"` keeps the first and the last two crumbs of a trail longer
   * than three and replaces the rest with an ellipsis. Defaults to `"none"`.
   */
  overflow?: "collapsed" | "none";
  separator?: "arrow" | "chevron" | "slash";
  showHomeIcon?: boolean;
  variant?: "default" | "minimal";
};

const DEFAULT_LABELS = {
  more: "More",
  region: "Breadcrumb",
} as const satisfies Required<BreadcrumbLabels>;

const COLLAPSE_THRESHOLD = 3;

const SEPARATOR_CHARS: Record<string, string> = {
  arrow: "→",
  chevron: "›",
  slash: "/",
};

const crumbVariants = cva("flex items-center gap-1", {
  defaultVariants: {
    tone: "muted",
  },
  variants: {
    tone: {
      current: "font-medium text-foreground",
      muted: "text-muted-foreground",
    },
  },
});

type Entry = { index: number; item: BreadcrumbItem };

function SeparatorIcon({ type }: { type: string }) {
  return (
    <span aria-hidden="true" className="text-muted-foreground">
      {SEPARATOR_CHARS[type] ?? "›"}
    </span>
  );
}

function CrumbBody({ item }: { item: BreadcrumbItem }): React.ReactElement {
  return (
    <>
      {item.icon ? <span className="flex-shrink-0">{item.icon}</span> : null}
      <span className={cn(typeof item.label === "string" && "truncate")}>
        {item.label}
      </span>
    </>
  );
}

function Crumb({
  isCurrent,
  item,
  linkComponent: LinkComponent,
  variant,
}: {
  isCurrent: boolean;
  item: BreadcrumbItem;
  linkComponent: NonNullable<BreadcrumbProps["linkComponent"]>;
  variant: NonNullable<BreadcrumbProps["variant"]>;
}): React.ReactElement {
  if (isCurrent) {
    return (
      <span
        aria-current="page"
        className={crumbVariants({
          tone: variant === "default" ? "current" : "muted",
        })}
      >
        <CrumbBody item={item} />
      </span>
    );
  }

  if (item.href) {
    return (
      <LinkComponent
        className={cn(
          crumbVariants({ tone: "muted" }),
          "transition-colors hover:text-foreground motion-reduce:transition-none",
        )}
        href={item.href}
      >
        <CrumbBody item={item} />
      </LinkComponent>
    );
  }

  return (
    <span className={crumbVariants({ tone: "muted" })}>
      <CrumbBody item={item} />
    </span>
  );
}

function getVisibleEntries(
  items: BreadcrumbItem[],
  overflow: NonNullable<BreadcrumbProps["overflow"]>,
): (Entry | null)[] {
  const entries = items.map((item, index) => ({ index, item }));
  if (overflow === "collapsed" && entries.length > COLLAPSE_THRESHOLD) {
    return [...entries.slice(0, 1), null, ...entries.slice(-2)];
  }
  return entries;
}

/**
 * Navigation trail of the current page hierarchy. The last item is the
 * current page: it renders as plain text with `aria-current="page"`, earlier
 * items with an `href` render as links.
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { href: "/", label: "Home" },
 *     { href: "/runs", label: "Runs" },
 *     { label: "research-2025" },
 *   ]}
 *   labels={{ region: "Fil d'Ariane" }}
 *   overflow="collapsed"
 * />
 * ```
 *
 * @public
 */
const Breadcrumb = ({
  className,
  items,
  labels,
  linkComponent = Link,
  overflow = "none",
  ref,
  separator = "chevron",
  variant = "default",
}: BreadcrumbProps & { ref?: React.Ref<HTMLElement> }): React.ReactElement => {
  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label={labels?.region ?? DEFAULT_LABELS.region}
      className={cn("flex items-center space-x-1 text-sm", className)}
      ref={ref}
    >
      <ol className="flex items-center space-x-1">
        {getVisibleEntries(items, overflow).map((entry, position) => (
          <li
            className="flex items-center"
            key={
              entry
                ? `${typeof entry.item.label === "string" ? entry.item.label : "breadcrumb"}-${entry.index.toString()}`
                : "breadcrumb-more"
            }
          >
            {position > 0 && (
              <span className="mx-2">
                <SeparatorIcon type={separator} />
              </span>
            )}

            {entry ? (
              <Crumb
                isCurrent={entry.index === lastIndex}
                item={entry.item}
                linkComponent={linkComponent}
                variant={variant}
              />
            ) : (
              <span className="text-muted-foreground">
                <span aria-hidden="true">…</span>
                <span className="sr-only">
                  {labels?.more ?? DEFAULT_LABELS.more}
                </span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
