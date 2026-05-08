"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Direction of an edge relative to the focused object.
 *
 * @public
 */
export type RelationshipDirection = "inbound" | "outbound";

/**
 * One edge in the relationship list.
 *
 * @public
 */
export type RelationshipEdge = {
  /** Direction of the edge relative to the focused object. */
  direction: RelationshipDirection;
  /** Stable identifier — used as the React key. */
  id: string;
  /** Optional click handler — when provided, the row becomes a button. */
  onActivate?: () => void;
  /** Relation kind (e.g. `"calls"`, `"emits"`, `"depends-on"`). */
  relation: string;
  /** Target id (when outbound) or source id (when inbound). */
  target: ReactNode;
  /** Optional secondary line beneath the row. */
  targetSublabel?: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type RelationshipInspectorLabels = {
  /** Empty-state copy. Defaults to `"No relationships"`. */
  empty?: string;
  /** Header for inbound edges. Defaults to `"Inbound"`. */
  inbound?: string;
  /** Header for outbound edges. Defaults to `"Outbound"`. */
  outbound?: string;
  /** Aria-label for the inspector. Defaults to `"Relationship inspector"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No relationships",
  inbound: "Inbound",
  outbound: "Outbound",
  region: "Relationship inspector",
} as const satisfies Required<RelationshipInspectorLabels>;

/**
 * Props for {@link RelationshipInspector}.
 *
 * @public
 */
export type RelationshipInspectorProps = {
  /** Edges to render. Empty list shows the empty state. */
  edges: RelationshipEdge[];
  /** Localizable strings. */
  labels?: RelationshipInspectorLabels;
  /** Optional inspector title. Defaults to `"Relationships"`. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const ARROW_GLYPH: Record<RelationshipDirection, string> = {
  inbound: "←",
  outbound: "→",
};

const RowBody = (props: { edge: RelationshipEdge }): React.ReactElement => {
  const { edge } = props;
  return (
    <span className="flex flex-1 items-center gap-2">
      <span aria-hidden="true" className="text-muted-foreground">
        {ARROW_GLYPH[edge.direction]}
      </span>
      <span className="flex flex-1 flex-col text-left">
        <span className="truncate text-xs text-foreground">{edge.target}</span>
        {edge.targetSublabel ? (
          <span className="truncate text-[10px] text-muted-foreground">
            {edge.targetSublabel}
          </span>
        ) : null}
      </span>
      <span className="rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {edge.relation}
      </span>
    </span>
  );
};

const Row = (props: { edge: RelationshipEdge }): React.ReactElement => {
  const { edge } = props;
  if (edge.onActivate) {
    const handleClick = (): void => {
      edge.onActivate?.();
    };
    return (
      <button
        className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-relationship-direction={edge.direction}
        data-relationship-row
        onClick={handleClick}
        type="button"
      >
        <RowBody edge={edge} />
      </button>
    );
  }
  return (
    <div
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5"
      data-relationship-direction={edge.direction}
      data-relationship-row
    >
      <RowBody edge={edge} />
    </div>
  );
};

const Group = (props: {
  edges: RelationshipEdge[];
  heading: string;
}): null | React.ReactElement => {
  const { edges, heading } = props;
  if (edges.length === 0) {
    return null;
  }
  return (
    <div className="space-y-1" data-relationship-group={heading.toLowerCase()}>
      <h4 className="px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {heading}
      </h4>
      <ul className="space-y-0.5">
        {edges.map((edge) => (
          <li key={edge.id}>
            <Row edge={edge} />
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Inspector panel listing inbound + outbound edges of the focused
 * object. Each row shows direction arrow, target id, optional sublabel,
 * and the relation kind chip. Pure presentation; the host computes
 * edges from the runtime graph and supplies an optional click handler
 * to jump to the related object.
 *
 * @example
 * ```tsx
 * <RelationshipInspector
 *   edges={[
 *     { id: "1", direction: "inbound",  target: "research-2025", relation: "spawned-by" },
 *     { id: "2", direction: "outbound", target: "summary.md",    relation: "emits" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const RelationshipInspector = forwardRef<
  HTMLElement,
  RelationshipInspectorProps
>((props, ref) => {
  const { className, edges, labels, title = "Relationships", ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const inbound = edges.filter((edge) => edge.direction === "inbound");
  const outbound = edges.filter((edge) => edge.direction === "outbound");
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border bg-background p-3 text-foreground",
        className,
      )}
      data-relationship-inspector
      ref={ref}
      {...rest}
    >
      <header>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </header>
      {edges.length === 0 ? (
        <p
          className="px-2 py-3 text-center text-xs text-muted-foreground"
          data-relationship-state="empty"
        >
          {resolvedLabels.empty}
        </p>
      ) : (
        <div className="space-y-2">
          <Group edges={inbound} heading={resolvedLabels.inbound} />
          <Group edges={outbound} heading={resolvedLabels.outbound} />
        </div>
      )}
    </section>
  );
});
RelationshipInspector.displayName = "RelationshipInspector";
