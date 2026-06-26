"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Role of an agent in the routing graph.
 *
 * @public
 */
export type RoutingRole = "fallback" | "primary" | "shadow";

const ROLE_LABEL: Record<RoutingRole, string> = {
  fallback: "Fallback",
  primary: "Primary",
  shadow: "Shadow",
};

const ROLE_TONE: Record<RoutingRole, string> = {
  fallback:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  primary:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  shadow: "border-border bg-muted/40 text-muted-foreground",
};

/**
 * One row in the routing assignment list.
 *
 * @public
 */
export type RoutingAssignment = {
  /** Display name (e.g. `"researcher"`, `"ranker"`). */
  agent: ReactNode;
  /** Stable identifier — used as the React key. */
  id: string;
  /** Optional load fraction `0..1` rendered as a thin progress bar. */
  load?: number;
  /** Optional click handler — when provided, the row becomes a button. */
  onActivate?: () => void;
  /** Role of the agent for this slot. */
  role: RoutingRole;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type RoutingAssignmentPanelLabels = {
  /** Empty-state copy. Defaults to `"No assignments"`. */
  empty?: string;
  /** Aria-label for the panel. Defaults to `"Routing assignments"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No assignments",
  region: "Routing assignments",
} as const satisfies Required<RoutingAssignmentPanelLabels>;

/**
 * Props for {@link RoutingAssignmentPanel}.
 *
 * @public
 */
export type RoutingAssignmentPanelProps = {
  /** Assignments in render order. */
  assignments: RoutingAssignment[];
  /** Localizable strings. */
  labels?: RoutingAssignmentPanelLabels;
  /** Panel title. Defaults to `"Routing"`. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const clampLoad = (value: number): number => {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

const RowBody = (props: {
  assignment: RoutingAssignment;
}): React.ReactElement => {
  const { assignment } = props;
  const load =
    assignment.load === undefined ? null : clampLoad(assignment.load);
  return (
    <span className="flex flex-1 flex-col gap-1">
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-foreground">
          {assignment.agent}
        </span>
        <span
          className={cn(
            "rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
            ROLE_TONE[assignment.role],
          )}
        >
          {ROLE_LABEL[assignment.role]}
        </span>
      </span>
      {load === null ? null : (
        <span
          aria-hidden="true"
          className="h-1 w-full overflow-hidden rounded-full bg-muted/40"
        >
          <span
            className="block h-full rounded-full bg-foreground/50"
            style={{ width: `${load * 100}%` }}
          />
        </span>
      )}
    </span>
  );
};

const Row = (props: { assignment: RoutingAssignment }): React.ReactElement => {
  const { assignment } = props;
  if (assignment.onActivate) {
    const handleActivateAssignment = (): void => {
      assignment.onActivate?.();
    };
    return (
      <button
        className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-routing-assignment={assignment.id}
        data-routing-role={assignment.role}
        onClick={handleActivateAssignment}
        type="button"
      >
        <RowBody assignment={assignment} />
      </button>
    );
  }
  return (
    <div
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5"
      data-routing-assignment={assignment.id}
      data-routing-role={assignment.role}
    >
      <RowBody assignment={assignment} />
    </div>
  );
};

/**
 * Right-dock panel listing the agent slots that the active route
 * dispatches to: primary handler + fallbacks + shadow probes. Each row
 * shows the agent name, role chip, and optional load bar. Pure
 * presentation; the host computes the assignments from the routing
 * config + observed traffic.
 *
 * @example
 * ```tsx
 * <RoutingAssignmentPanel
 *   assignments={[
 *     { id: "1", agent: "researcher",     role: "primary",  load: 0.82 },
 *     { id: "2", agent: "researcher-mini", role: "fallback", load: 0.04 },
 *     { id: "3", agent: "shadow-eval",    role: "shadow" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const RoutingAssignmentPanel = ({
  ref,
  ...props
}: RoutingAssignmentPanelProps & { ref?: React.Ref<HTMLElement> }) => {
  const { assignments, className, labels, title = "Routing", ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border bg-background p-3 text-foreground",
        className,
      )}
      data-routing-assignment-panel
      ref={ref}
      {...rest}
    >
      <header>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </header>
      {assignments.length === 0 ? (
        <p
          className="px-2 py-3 text-center text-xs text-muted-foreground"
          data-routing-state="empty"
        >
          {resolvedLabels.empty}
        </p>
      ) : (
        <ul className="space-y-0.5">
          {assignments.map((assignment) => (
            <li key={assignment.id}>
              <Row assignment={assignment} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
RoutingAssignmentPanel.displayName = "RoutingAssignmentPanel";
