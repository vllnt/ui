"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * One row in the property grid.
 *
 * @public
 */
export type PropertyEntry = {
  /** Stable id (used as React key + analytics hook). */
  id: string;
  /** Property label (left column). */
  label: ReactNode;
  /** Optional sublabel rendered beneath the label. */
  sublabel?: ReactNode;
  /** Property value (right column). */
  value: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PropertySectionLabels = {
  /** Aria-label for the section. Defaults to `"Properties"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Properties",
} as const satisfies Required<PropertySectionLabels>;

/**
 * Props for {@link PropertySection}.
 *
 * @public
 */
export type PropertySectionProps = {
  /** Optional collapsible affordance. Pass `false` to render the body inline (default). */
  collapsible?: boolean;
  /** Property entries in render order. */
  entries: PropertyEntry[];
  /** Localizable strings. */
  labels?: PropertySectionLabels;
  /** Optional title rendered as a small uppercase heading above the grid. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const Grid = (props: { entries: PropertyEntry[] }): React.ReactElement => (
  <dl
    className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 px-3 pb-3 pt-1 text-xs"
    data-property-grid
  >
    {props.entries.map((entry) => (
      <div className="contents" key={entry.id}>
        <dt
          className="flex flex-col text-muted-foreground"
          data-property-id={entry.id}
        >
          <span>{entry.label}</span>
          {entry.sublabel ? (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
              {entry.sublabel}
            </span>
          ) : null}
        </dt>
        <dd className="text-right text-foreground">{entry.value}</dd>
      </div>
    ))}
  </dl>
);

const Body = (props: {
  collapsible: boolean;
  entries: PropertyEntry[];
  title?: ReactNode;
}): React.ReactElement => {
  const grid = <Grid entries={props.entries} />;
  if (!props.title) {
    return grid;
  }
  if (props.collapsible) {
    return (
      <details className="group" open>
        <summary
          className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          data-property-summary
        >
          <span>{props.title}</span>
          <span
            aria-hidden="true"
            className="text-muted-foreground/70 group-open:rotate-90"
          >
            ›
          </span>
        </summary>
        {grid}
      </details>
    );
  }
  return (
    <>
      <header
        className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
        data-property-header
      >
        {props.title}
      </header>
      {grid}
    </>
  );
};

/**
 * Compact key / value grid for an inspector panel. Use one
 * `PropertySection` per logical group (Identity, Layout, State, etc.)
 * so the right dock stays scannable. Pure presentation — the host
 * computes the entries from the current selection.
 *
 * @example
 * ```tsx
 * <PropertySection
 *   title="Layout"
 *   entries={[
 *     { id: "x", label: "X", value: "120" },
 *     { id: "y", label: "Y", value: "80" },
 *     { id: "size", label: "Size", value: "240 × 120" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const PropertySection = ({
  ref,
  ...props
}: PropertySectionProps & { ref?: React.Ref<HTMLElement> }) => {
  const {
    className,
    collapsible = false,
    entries,
    labels,
    title,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "rounded-lg border bg-background text-foreground",
        className,
      )}
      data-property-section
      ref={ref}
      {...rest}
    >
      <Body collapsible={collapsible} entries={entries} title={title} />
    </section>
  );
};
PropertySection.displayName = "PropertySection";
