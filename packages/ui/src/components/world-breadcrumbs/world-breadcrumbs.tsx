"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * One spatial trail crumb.
 *
 * @public
 */
export type WorldCrumb = {
  /** Stable identifier — used as the React key. */
  id: string;
  /** Optional kind (drives the leading glyph). */
  kind?: WorldCrumbKind;
  /** Display label. */
  label: ReactNode;
};

/**
 * Glyph hint for a crumb kind.
 *
 * @public
 */
export type WorldCrumbKind =
  | "agent"
  | "artifact"
  | "group"
  | "run"
  | "task"
  | "world";

const KIND_GLYPH: Record<WorldCrumbKind, string> = {
  agent: "◇",
  artifact: "◌",
  group: "▤",
  run: "▶",
  task: "▢",
  world: "✦",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type WorldBreadcrumbsLabels = {
  /** Empty-state copy. Defaults to `"No location"`. */
  empty?: string;
  /** Aria-label override. Defaults to `"World breadcrumbs"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No location",
  region: "World breadcrumbs",
} as const satisfies Required<WorldBreadcrumbsLabels>;

/**
 * Props for {@link WorldBreadcrumbs}.
 *
 * @public
 */
export type WorldBreadcrumbsProps = {
  /** Trail in render order — the last crumb represents the active location. */
  crumbs: WorldCrumb[];
  /** Localizable strings. */
  labels?: WorldBreadcrumbsLabels;
  /** Click handler — receives the activated crumb id. */
  onSelect?: (id: string) => void;
} & ComponentPropsWithoutRef<"nav">;

const Crumb = (props: {
  crumb: WorldCrumb;
  isLast: boolean;
  onSelect?: (id: string) => void;
}): React.ReactElement => {
  const { crumb, isLast, onSelect } = props;
  const glyph = crumb.kind ? KIND_GLYPH[crumb.kind] : null;
  const handleClick = (): void => {
    onSelect?.(crumb.id);
  };
  const text = (
    <span className="inline-flex items-center gap-1">
      {glyph ? (
        <span aria-hidden="true" className="text-muted-foreground">
          {glyph}
        </span>
      ) : null}
      <span className="truncate">{crumb.label}</span>
    </span>
  );
  if (isLast || !onSelect) {
    return (
      <span
        aria-current={isLast ? "location" : undefined}
        className={cn(
          "inline-flex items-center text-xs",
          isLast ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
        data-world-breadcrumb={crumb.id}
        data-world-breadcrumb-active={isLast}
      >
        {text}
      </span>
    );
  }
  return (
    <button
      className="inline-flex items-center rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-world-breadcrumb={crumb.id}
      data-world-breadcrumb-active="false"
      onClick={handleClick}
      type="button"
    >
      {text}
    </button>
  );
};

/**
 * Spatial trail showing where the viewport sits in a hierarchy of
 * worlds / groups / runs / agents. Distinct from \`Breadcrumb\`
 * (route-based, document-tree style) — this primitive describes the
 * canvas's spatial location and supports per-kind glyphs.
 *
 * Pure presentation; the host computes the trail from the active
 * viewport target and the world graph, and resolves \`onSelect\` to a
 * camera transition.
 *
 * @example
 * ```tsx
 * <WorldBreadcrumbs
 *   crumbs={[
 *     { id: "world", kind: "world", label: "Production" },
 *     { id: "group", kind: "group", label: "Ingest cluster" },
 *     { id: "run",   kind: "run",   label: "research-2025" },
 *   ]}
 *   onSelect={jumpTo}
 * />
 * ```
 *
 * @public
 */
export const WorldBreadcrumbs = (
  props: WorldBreadcrumbsProps & React.RefAttributes<HTMLElement>,
) => {
  const { className, crumbs, labels, onSelect, ref, ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  if (crumbs.length === 0) {
    return (
      <nav
        aria-label={resolvedLabels.region}
        className={cn(
          "inline-flex items-center text-xs text-muted-foreground",
          className,
        )}
        data-world-breadcrumbs
        data-world-breadcrumbs-state="empty"
        ref={ref}
        {...rest}
      >
        {resolvedLabels.empty}
      </nav>
    );
  }
  return (
    <nav
      aria-label={resolvedLabels.region}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
      data-world-breadcrumbs
      ref={ref}
      {...rest}
    >
      {crumbs.map((crumb, index) => (
        <span className="inline-flex items-center gap-1.5" key={crumb.id}>
          <Crumb
            crumb={crumb}
            isLast={index === crumbs.length - 1}
            onSelect={onSelect}
          />
          {index < crumbs.length - 1 ? (
            <span
              aria-hidden="true"
              className="text-muted-foreground/60"
              data-world-breadcrumb-sep
            >
              ›
            </span>
          ) : null}
        </span>
      ))}
    </nav>
  );
};
WorldBreadcrumbs.displayName = "WorldBreadcrumbs";
