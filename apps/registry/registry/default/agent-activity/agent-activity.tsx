"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Circle,
  Loader2,
  MinusCircle,
} from "lucide-react";

import { cn } from "@vllnt/ui";

/**
 * Status state for a single {@link AgentStep}.
 *
 * @public
 */
export type AgentStepStatus =
  | "completed"
  | "error"
  | "pending"
  | "running"
  | "skipped";

/**
 * Status state for the parent {@link AgentActivity}.
 *
 * @public
 */
export type AgentActivityStatus = "completed" | "error" | "idle" | "running";

const STATUS_CLASSES: Record<
  AgentStepStatus,
  { iconClass: string; ringClass: string; rowClass: string }
> = {
  completed: {
    iconClass: "text-emerald-600 dark:text-emerald-400",
    ringClass: "ring-emerald-500/30",
    rowClass: "border-border bg-background",
  },
  error: {
    iconClass: "text-destructive",
    ringClass: "ring-destructive/40",
    rowClass: "border-destructive/40 bg-destructive/5",
  },
  pending: {
    iconClass: "text-muted-foreground",
    ringClass: "ring-border",
    rowClass: "border-border bg-muted/20 text-muted-foreground",
  },
  running: {
    iconClass: "text-primary",
    ringClass: "ring-primary/30",
    rowClass: "border-primary/30 bg-primary/5",
  },
  skipped: {
    iconClass: "text-muted-foreground/60",
    ringClass: "ring-border",
    rowClass: "border-border bg-background text-muted-foreground/80",
  },
};

const DEFAULT_STATUS_ICON: Record<AgentStepStatus, ReactNode> = {
  completed: <CheckCircle2 aria-hidden="true" className="size-4" />,
  error: <AlertTriangle aria-hidden="true" className="size-4" />,
  pending: <Circle aria-hidden="true" className="size-4" />,
  running: <Loader2 aria-hidden="true" className="size-4 animate-spin" />,
  skipped: <MinusCircle aria-hidden="true" className="size-4" />,
};

type StepContextValue = {
  status: AgentStepStatus;
};

const StepContext = createContext<StepContextValue>({ status: "pending" });

/**
 * Localizable strings.
 *
 * @public
 */
export type AgentActivityLabels = {
  /** Caption above the steps list. Defaults to `"Activity"`. */
  activity?: string;
  /** Caption for the collapse-details toggle. Defaults to `"Hide details"`. */
  collapse?: string;
  /** Aria-label for the elapsed-time region. Defaults to `"Elapsed"`. */
  elapsed?: string;
  /** Caption for the expand-details toggle. Defaults to `"Show details"`. */
  expand?: string;
};

const DEFAULT_LABELS = {
  activity: "Activity",
  collapse: "Hide details",
  elapsed: "Elapsed",
  expand: "Show details",
} as const satisfies Required<AgentActivityLabels>;

/**
 * Props for {@link AgentActivity}.
 *
 * @public
 */
export type AgentActivityProps = {
  /** Optional total elapsed time string shown in the header. */
  elapsed?: ReactNode;
  /** Localizable strings. */
  labels?: AgentActivityLabels;
  /** Top-level agent status. Defaults to `"idle"`. */
  status?: AgentActivityStatus;
} & ComponentPropsWithoutRef<"section">;

const ACTIVITY_LIVE_REGION_ROLE: Record<AgentActivityStatus, "log" | "status"> =
  {
    completed: "status",
    error: "status",
    idle: "status",
    running: "log",
  };

/**
 * Visual display of an AI agent's execution chain — steps taken, tools
 * called, decisions made, and current progress. Composes {@link AgentStep}
 * children. Use `aria-live="polite"` on the log so assistive tech reads
 * new steps as the agent progresses without stealing focus.
 *
 * @example
 * ```tsx
 * <AgentActivity status="running" elapsed="3.2s">
 *   <AgentStep status="completed" icon={<Search />}>
 *     <AgentStepTitle>Searching codebase</AgentStepTitle>
 *     <AgentStepDetail>Found 12 files matching "auth".</AgentStepDetail>
 *     <AgentStepDuration>1.2s</AgentStepDuration>
 *   </AgentStep>
 *   <AgentStep status="running" icon={<Code />}>
 *     <AgentStepTitle>Writing fix</AgentStepTitle>
 *     <AgentStepProgress value={60} />
 *   </AgentStep>
 * </AgentActivity>
 * ```
 *
 * @public
 */
export const AgentActivity = forwardRef<HTMLElement, AgentActivityProps>(
  (props, ref) => {
    const {
      children,
      className,
      elapsed,
      labels,
      status = "idle",
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    return (
      <section
        aria-live={status === "running" ? "polite" : "off"}
        className={cn(
          "flex flex-col gap-3 rounded-2xl border bg-background p-4",
          className,
        )}
        data-status={status}
        ref={ref}
        role={ACTIVITY_LIVE_REGION_ROLE[status]}
        {...rest}
      >
        <header className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {resolvedLabels.activity}
          </h3>
          {elapsed ? (
            <span
              aria-label={resolvedLabels.elapsed}
              className="text-xs font-mono text-muted-foreground"
            >
              {elapsed}
            </span>
          ) : null}
        </header>
        <ol className="flex flex-col gap-2">{children}</ol>
      </section>
    );
  },
);
AgentActivity.displayName = "AgentActivity";

/**
 * Props for {@link AgentStep}.
 *
 * @public
 */
export type AgentStepProps = {
  /** When false, the step renders the toggle but starts collapsed. */
  defaultOpen?: boolean;
  /** Optional icon shown to the left of the title. */
  icon?: ReactNode;
  /** Step status. */
  status: AgentStepStatus;
} & ComponentPropsWithoutRef<"li">;

type ContentSplit = {
  body: ReactNode[];
  header: ReactNode[];
};

function getDisplayName(value: unknown): string | undefined {
  if (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    "displayName" in value &&
    typeof value.displayName === "string"
  ) {
    return value.displayName;
  }
  return undefined;
}

function isAgentStepDetailElement(child: ReactNode): boolean {
  if (child === null || typeof child !== "object") return false;
  if (!("type" in child)) return false;
  return getDisplayName(child.type) === "AgentStepDetail";
}

function splitChildren(children: ReactNode): ContentSplit {
  const items = Array.isArray(children)
    ? (children as ReactNode[])
    : [children];
  return items.reduce<ContentSplit>(
    (split, child) => {
      if (isAgentStepDetailElement(child)) {
        split.body.push(child);
      } else {
        split.header.push(child);
      }
      return split;
    },
    { body: [], header: [] },
  );
}

/**
 * One row inside an {@link AgentActivity}. The component partitions
 * children into an always-visible header (title, duration, progress) and a
 * collapsible body (any number of {@link AgentStepDetail} blocks).
 *
 * @public
 */
type StepRowProps = {
  detailsId: string;
  hasDetails: boolean;
  header: ReactNode;
  icon: ReactNode;
  iconClass: string;
  labels: Required<AgentActivityLabels>;
  onToggle: () => void;
  open: boolean;
};

function StepRow({
  detailsId,
  hasDetails,
  header,
  icon,
  iconClass,
  labels,
  onToggle,
  open,
}: StepRowProps): ReactNode {
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center",
          iconClass,
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">{header}</div>
      {hasDetails ? (
        <button
          aria-controls={detailsId}
          aria-expanded={open}
          aria-label={open ? labels.collapse : labels.expand}
          className="ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={onToggle}
          type="button"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform",
              open ? "rotate-180" : "rotate-0",
            )}
          />
        </button>
      ) : null}
    </div>
  );
}

export const AgentStep = forwardRef<HTMLLIElement, AgentStepProps>(
  (props, ref) => {
    const {
      children,
      className,
      defaultOpen = true,
      icon,
      status,
      ...rest
    } = props;
    const split = useMemo(() => splitChildren(children), [children]);
    const palette = STATUS_CLASSES[status];
    const hasDetails = split.body.length > 0;
    const [open, setOpen] = useState(defaultOpen);
    const detailsId = useId();

    const handleToggle = useCallback(() => {
      setOpen((value) => !value);
    }, []);

    const contextValue = useMemo<StepContextValue>(
      () => ({ status }),
      [status],
    );
    const resolvedIcon = icon ?? DEFAULT_STATUS_ICON[status];

    return (
      <li
        className={cn(
          "rounded-xl border ring-1",
          palette.rowClass,
          palette.ringClass,
          className,
        )}
        data-status={status}
        ref={ref}
        {...rest}
      >
        <StepContext.Provider value={contextValue}>
          <StepRow
            detailsId={detailsId}
            hasDetails={hasDetails}
            header={split.header}
            icon={resolvedIcon}
            iconClass={palette.iconClass}
            labels={DEFAULT_LABELS}
            onToggle={handleToggle}
            open={open}
          />
          {hasDetails && open ? (
            <div
              className="border-t border-border/60 px-3 py-2 text-xs"
              id={detailsId}
            >
              <div className="flex flex-col gap-2 pl-8">{split.body}</div>
            </div>
          ) : null}
        </StepContext.Provider>
      </li>
    );
  },
);
AgentStep.displayName = "AgentStep";

/**
 * Props for {@link AgentStepTitle}.
 *
 * @public
 */
export type AgentStepTitleProps = ComponentPropsWithoutRef<"p">;

/**
 * Title slot for an {@link AgentStep}.
 *
 * @public
 */
export const AgentStepTitle = forwardRef<
  HTMLParagraphElement,
  AgentStepTitleProps
>(({ className, ...rest }, ref) => (
  <p
    className={cn(
      "text-sm font-medium leading-tight text-foreground",
      className,
    )}
    ref={ref}
    {...rest}
  />
));
AgentStepTitle.displayName = "AgentStepTitle";

/**
 * Props for {@link AgentStepDuration}.
 *
 * @public
 */
export type AgentStepDurationProps = ComponentPropsWithoutRef<"span">;

/**
 * Duration badge for an {@link AgentStep}.
 *
 * @public
 */
export const AgentStepDuration = forwardRef<
  HTMLSpanElement,
  AgentStepDurationProps
>(({ className, ...rest }, ref) => (
  <span
    className={cn("font-mono text-xs text-muted-foreground", className)}
    ref={ref}
    {...rest}
  />
));
AgentStepDuration.displayName = "AgentStepDuration";

/**
 * Props for {@link AgentStepProgress}.
 *
 * @public
 */
export type AgentStepProgressProps = {
  /** Optional aria-label override. Defaults to `"Step progress"`. */
  label?: string;
  /** Progress value, 0–100. */
  value: number;
} & Omit<ComponentPropsWithoutRef<"div">, "role">;

/**
 * Progress bar for a running {@link AgentStep}.
 *
 * @public
 */
export const AgentStepProgress = forwardRef<
  HTMLDivElement,
  AgentStepProgressProps
>(({ className, label = "Step progress", value, ...rest }, ref) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clamped}
      className={cn("h-1.5 w-full rounded-full bg-muted", className)}
      ref={ref}
      role="progressbar"
      {...rest}
    >
      <span
        className="block h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${clamped.toString()}%` }}
      />
    </div>
  );
});
AgentStepProgress.displayName = "AgentStepProgress";

/**
 * Props for {@link AgentStepDetail}.
 *
 * @public
 */
export type AgentStepDetailProps = ComponentPropsWithoutRef<"div">;

/**
 * Collapsible detail block inside an {@link AgentStep} (tool output, log
 * snippet, anything secondary).
 *
 * @public
 */
export const AgentStepDetail = forwardRef<HTMLDivElement, AgentStepDetailProps>(
  ({ className, ...rest }, ref) => (
    <div
      className={cn("text-xs text-muted-foreground", className)}
      ref={ref}
      {...rest}
    />
  ),
);
AgentStepDetail.displayName = "AgentStepDetail";

/**
 * Hook for reading the current step's status from inside a custom child.
 *
 * @public
 */
export function useAgentStepStatus(): AgentStepStatus {
  return useContext(StepContext).status;
}
