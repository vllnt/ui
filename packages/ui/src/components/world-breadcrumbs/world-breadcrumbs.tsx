"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * One node in the world hierarchy (workspace → project → board → view).
 *
 * @public
 */
export type WorldCrumb = {
  /** Optional href for client-side navigation. When set, the crumb renders as an anchor. */
  href?: string;
  /** Optional icon glyph rendered before the label. */
  icon?: ReactNode;
  /** Stable id used for analytics + React keys. */
  id: string;
  /** Display label. */
  label: ReactNode;
  /** Optional sublabel rendered beneath the label (rare; for "@v2" / "draft" badges). */
  meta?: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type WorldBreadcrumbsLabels = {
  /** Aria-label for the breadcrumb nav. Defaults to `"World breadcrumbs"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "World breadcrumbs",
} as const satisfies Required<WorldBreadcrumbsLabels>;

/**
 * Props for {@link WorldBreadcrumbs}.
 *
 * @public
 */
export type WorldBreadcrumbsProps = {
  /** Hierarchical crumbs from root → leaf. The last crumb is the current location. */
  crumbs: WorldCrumb[];
  /** Localizable strings. */
  labels?: WorldBreadcrumbsLabels;
  /** Fires when the user picks an ancestor crumb. */
  onNavigate?: (crumb: WorldCrumb) => void;
  /** Custom separator. Defaults to a slash glyph. */
  separator?: ReactNode;
} & ComponentPropsWithoutRef<"nav">;

type CrumbButtonProps = {
  crumb: WorldCrumb;
  current: boolean;
  onSelect: (crumb: WorldCrumb) => void;
};

function CrumbButton({
  crumb,
  current,
  onSelect,
}: CrumbButtonProps): ReactNode {
  const content = (
    <span className="inline-flex items-center gap-1">
      {crumb.icon ? (
        <span aria-hidden="true" className="inline-flex h-3 w-3 shrink-0">
          {crumb.icon}
        </span>
      ) : null}
      <span className="font-medium">{crumb.label}</span>
      {crumb.meta ? (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {crumb.meta}
        </span>
      ) : null}
    </span>
  );
  if (current) {
    return (
      <span
        aria-current="location"
        className="text-foreground"
        data-crumb-current="true"
        data-crumb-id={crumb.id}
      >
        {content}
      </span>
    );
  }
  if (crumb.href) {
    return (
      <a
        className="text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-crumb-id={crumb.id}
        href={crumb.href}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          onSelect(crumb);
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      className="text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-crumb-id={crumb.id}
      onClick={() => {
        onSelect(crumb);
      }}
      type="button"
    >
      {content}
    </button>
  );
}

/**
 * Hierarchical breadcrumbs for spatial canvases. Renders the path
 * (workspace → project → board → view) with the leaf as the current
 * location. Distinct from generic `Breadcrumb`: every crumb in the
 * world hierarchy stays addressable, the separator is a slash that fits
 * the canvas chrome, and the trailing crumb is plain (no link).
 *
 * @example
 * ```tsx
 * <WorldBreadcrumbs
 *   crumbs={[
 *     { id: "ws", label: "Acme" },
 *     { id: "proj", label: "Q4 launch" },
 *     { id: "view", label: "Release timeline" },
 *   ]}
 *   onNavigate={(crumb) => navigateTo(crumb.id)}
 * />
 * ```
 *
 * @public
 */
export const WorldBreadcrumbs = forwardRef<HTMLElement, WorldBreadcrumbsProps>(
  (props, ref) => {
    const {
      className,
      crumbs,
      labels,
      onNavigate,
      separator = "/",
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const handleSelect = (crumb: WorldCrumb): void => {
      onNavigate?.(crumb);
    };
    return (
      <nav
        aria-label={resolvedLabels.region}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border bg-background/95 px-2 py-1 text-xs text-foreground shadow-sm backdrop-blur",
          className,
        )}
        data-crumbs-depth={crumbs.length}
        ref={ref}
        {...rest}
      >
        <ol className="flex items-center gap-1.5">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li className="flex items-center gap-1.5" key={crumb.id}>
                <CrumbButton
                  crumb={crumb}
                  current={last}
                  onSelect={handleSelect}
                />
                {last ? null : (
                  <span
                    aria-hidden="true"
                    className="select-none text-muted-foreground/60"
                  >
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);
WorldBreadcrumbs.displayName = "WorldBreadcrumbs";
