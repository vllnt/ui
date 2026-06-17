"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * Object kind — drives the chip glyph + label.
 *
 * @public
 */
export type ObjectInspectorKind =
  | "agent"
  | "artifact"
  | "input"
  | "output"
  | "run"
  | "task";

const KIND_LABEL: Record<ObjectInspectorKind, string> = {
  agent: "Agent",
  artifact: "Artifact",
  input: "Input",
  output: "Output",
  run: "Run",
  task: "Task",
};

const KIND_GLYPH: Record<ObjectInspectorKind, string> = {
  agent: "◇",
  artifact: "◌",
  input: "↘",
  output: "↗",
  run: "▶",
  task: "▢",
};

/**
 * Live status — drives the colored dot.
 *
 * @public
 */
export type ObjectInspectorStatus =
  | "complete"
  | "failed"
  | "idle"
  | "queued"
  | "running";

const STATUS_DOT: Record<ObjectInspectorStatus, string> = {
  complete: "bg-emerald-500",
  failed: "bg-red-500",
  idle: "bg-muted-foreground",
  queued: "bg-amber-500",
  running: "bg-blue-500 animate-pulse",
};

const STATUS_LABEL: Record<ObjectInspectorStatus, string> = {
  complete: "Complete",
  failed: "Failed",
  idle: "Idle",
  queued: "Queued",
  running: "Running",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ObjectInspectorLabels = {
  /** Empty-state copy. Defaults to `"No selection"`. */
  empty?: string;
  /** Aria-label for the inspector. Defaults to `"Object inspector"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No selection",
  region: "Object inspector",
} as const satisfies Required<ObjectInspectorLabels>;

/**
 * Props for {@link ObjectInspector}.
 *
 * @public
 */
export type ObjectInspectorProps = {
  /** Object kind. When omitted, the inspector renders the empty state. */
  kind?: ObjectInspectorKind;
  /** Localizable strings. */
  labels?: ObjectInspectorLabels;
  /** Object status. Defaults to `"idle"`. */
  status?: ObjectInspectorStatus;
  /** Optional subtitle (id, owner, model). */
  subtitle?: ReactNode;
  /** Object title. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const KindChip = (props: { kind: ObjectInspectorKind }): React.ReactElement => (
  <span
    aria-label={KIND_LABEL[props.kind]}
    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
  >
    <span aria-hidden="true">{KIND_GLYPH[props.kind]}</span>
    {KIND_LABEL[props.kind]}
  </span>
);

const StatusDot = (props: {
  status: ObjectInspectorStatus;
}): React.ReactElement => (
  <span
    aria-label={`Status ${STATUS_LABEL[props.status]}`}
    className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
  >
    <span
      aria-hidden="true"
      className={cn("size-1.5 rounded-full", STATUS_DOT[props.status])}
    />
    {STATUS_LABEL[props.status]}
  </span>
);

const Header = (props: {
  kind: ObjectInspectorKind;
  status: ObjectInspectorStatus;
  subtitle?: ReactNode;
  title: ReactNode;
}): React.ReactElement => (
  <header className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-2">
      <KindChip kind={props.kind} />
      <StatusDot status={props.status} />
    </div>
    <div className="space-y-0.5">
      <h3 className="truncate text-sm font-semibold text-foreground">
        {props.title}
      </h3>
      {props.subtitle ? (
        <p className="truncate text-xs text-muted-foreground">
          {props.subtitle}
        </p>
      ) : null}
    </div>
  </header>
);

/**
 * Inspector header for the right dock. Renders kind chip + status dot
 * + title + subtitle, then any children below (typically a stack of
 * {@link "../property-section/property-section".PropertySection} blocks). Pure presentation; the host
 * derives props from the current selection and slots the property
 * sections.
 *
 * @example
 * ```tsx
 * <ObjectInspector
 *   kind="run"
 *   status="running"
 *   title="research-2025-04-15"
 *   subtitle="claude-3.7"
 * >
 *   <PropertySection title="Layout" entries={…} />
 *   <PropertySection title="State" entries={…} />
 * </ObjectInspector>
 * ```
 *
 * @public
 */
export const ObjectInspector = ({
  ref,
  ...props
}: ObjectInspectorProps & { ref?: React.Ref<HTMLElement> }) => {
  const {
    children,
    className,
    kind,
    labels,
    status = "idle",
    subtitle,
    title,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  if (!kind || !title) {
    return (
      <section
        aria-label={resolvedLabels.region}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1 rounded-2xl border bg-background p-6 text-center text-xs text-muted-foreground",
          className,
        )}
        data-object-inspector
        data-object-state="empty"
        ref={ref}
        {...rest}
      >
        <span aria-hidden="true" className="text-lg">
          ◇
        </span>
        <span>{resolvedLabels.empty}</span>
      </section>
    );
  }
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col gap-3 rounded-2xl border bg-background p-3 text-foreground",
        className,
      )}
      data-object-inspector
      data-object-kind={kind}
      data-object-status={status}
      ref={ref}
      {...rest}
    >
      <Header kind={kind} status={status} subtitle={subtitle} title={title} />
      {children ? <div className="space-y-2">{children}</div> : null}
    </section>
  );
};
ObjectInspector.displayName = "ObjectInspector";
