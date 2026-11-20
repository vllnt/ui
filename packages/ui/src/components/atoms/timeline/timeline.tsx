"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  use,
  useMemo,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/utils";

/**
 * Visual orientation for a {@link Timeline}.
 *
 * @public
 */
export type TimelineOrientation = "horizontal" | "vertical";

/**
 * Status for a {@link TimelineItem}.
 *
 * @public
 */
export type TimelineItemStatus = "active" | "completed" | "upcoming";

/**
 * Color theme for a {@link TimelineItem} marker.
 *
 * @public
 */
export type TimelineColor =
  | "amber"
  | "blue"
  | "emerald"
  | "neutral"
  | "purple"
  | "red"
  | "rose";

const STATUS_CLASSES: Record<
  TimelineItemStatus,
  { connector: string; markerBorder: string; markerFill: string }
> = {
  active: {
    connector: "border-solid border-primary",
    markerBorder: "border-primary",
    markerFill: "bg-background ring-2 ring-primary",
  },
  completed: {
    connector: "border-solid border-primary",
    markerBorder: "border-primary",
    markerFill: "bg-primary",
  },
  upcoming: {
    connector: "border-dashed border-muted-foreground/40",
    markerBorder: "border-muted-foreground/40",
    markerFill: "bg-background",
  },
};

const COLOR_OVERRIDES: Record<TimelineColor, { border: string; fill: string }> =
  {
    amber: {
      border: "border-amber-500",
      fill: "bg-amber-500",
    },
    blue: {
      border: "border-blue-500",
      fill: "bg-blue-500",
    },
    emerald: {
      border: "border-emerald-500",
      fill: "bg-emerald-500",
    },
    neutral: {
      border: "border-muted-foreground",
      fill: "bg-muted-foreground",
    },
    purple: {
      border: "border-purple-500",
      fill: "bg-purple-500",
    },
    red: {
      border: "border-red-500",
      fill: "bg-red-500",
    },
    rose: {
      border: "border-rose-500",
      fill: "bg-rose-500",
    },
  };

/**
 * Localizable status words for a {@link TimelineItem}. Each word stays
 * visually hidden and names the item's status for assistive technology. An
 * empty string omits the word.
 *
 * @public
 */
export type TimelineLabels = {
  /** Word for an `active` item. Defaults to `"In progress"`. */
  active?: string;
  /** Word for a `completed` item. Defaults to `"Completed"`. */
  completed?: string;
  /** Word for an `upcoming` item. Defaults to `"Upcoming"`. */
  upcoming?: string;
};

const DEFAULT_LABELS = {
  active: "In progress",
  completed: "Completed",
  upcoming: "Upcoming",
} as const satisfies Required<TimelineLabels>;

type TimelineContextValue = {
  labels: TimelineLabels;
  orientation: TimelineOrientation;
};

const TimelineContext = createContext<TimelineContextValue>({
  labels: {},
  orientation: "vertical",
});

/**
 * Hook for reading the surrounding {@link Timeline}'s orientation. Useful
 * for custom children that need to adapt their layout.
 *
 * @public
 */
export function useTimelineOrientation(): TimelineOrientation {
  return use(TimelineContext).orientation;
}

const timelineVariants = cva("flex", {
  defaultVariants: {
    orientation: "vertical",
  },
  variants: {
    orientation: {
      horizontal: "flex-row gap-0 overflow-x-auto",
      vertical: "flex-col gap-0",
    },
  },
});

/**
 * Props for {@link Timeline}.
 *
 * @public
 */
export type TimelineProps = {
  /** Localizable status words shared by every item. Items can override them. */
  labels?: TimelineLabels;
} & ComponentPropsWithoutRef<"ol"> &
  VariantProps<typeof timelineVariants>;

/**
 * Vertical or horizontal timeline of sequential events. Renders an
 * ordered list (`<ol>`) so the order matters semantically. Children
 * should be {@link TimelineItem}s.
 *
 * The component injects connector styling per child via context — the
 * last item drops its trailing connector automatically.
 *
 * @example
 * ```tsx
 * <Timeline>
 *   <TimelineItem title="Project started" date="Jan 2026" status="completed" />
 *   <TimelineItem title="MVP launch" date="Mar 2026" status="completed" />
 *   <TimelineItem title="V2" date="Jul 2026" status="active" />
 *   <TimelineItem title="Public release" date="Q4 2026" status="upcoming" />
 * </Timeline>
 * ```
 *
 * @public
 */
export const Timeline = ({
  children,
  className,
  labels,
  orientation,
  ref,
  ...rest
}: TimelineProps & { ref?: React.Ref<HTMLOListElement> }) => {
  const resolvedOrientation: TimelineOrientation = orientation ?? "vertical";
  const contextValue = useMemo<TimelineContextValue>(
    () => ({ labels: labels ?? {}, orientation: resolvedOrientation }),
    [labels, resolvedOrientation],
  );
  return (
    <TimelineContext.Provider value={contextValue}>
      <ol
        className={cn(timelineVariants({ orientation }), className)}
        data-orientation={resolvedOrientation}
        ref={ref}
        {...rest}
      >
        {children}
      </ol>
    </TimelineContext.Provider>
  );
};
Timeline.displayName = "Timeline";

/**
 * Props for {@link TimelineItem}.
 *
 * @public
 */
export type TimelineItemProps = {
  /** Optional color override for the marker. Falls back to the status palette. */
  color?: TimelineColor;
  /** Optional date / time caption rendered alongside the title. */
  date?: ReactNode;
  /** Optional sub-headline rendered under the title. */
  description?: ReactNode;
  /** Optional icon rendered inside the marker. */
  icon?: ReactNode;
  /** When true, suppresses the trailing connector. Defaults to `false`. */
  isLast?: boolean;
  /** Status words for this item. Overrides the {@link Timeline} `labels`. */
  labels?: TimelineLabels;
  /** Status drives marker fill and connector style. Defaults to `"upcoming"`. */
  status?: TimelineItemStatus;
  /** Item title. */
  title: ReactNode;
} & ComponentPropsWithoutRef<"li">;

type MarkerProps = {
  color?: TimelineColor;
  icon?: ReactNode;
  status: TimelineItemStatus;
};

function Marker({ color, icon, status }: MarkerProps): ReactNode {
  const palette = STATUS_CLASSES[status];
  const override = color ? COLOR_OVERRIDES[color] : undefined;
  const borderClass = override?.border ?? palette.markerBorder;
  const fillClass = override?.fill ?? palette.markerFill;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-background text-[10px]",
        borderClass,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center text-foreground [&>svg]:h-3 [&>svg]:w-3",
            status === "completed" ? "text-primary-foreground" : "",
          )}
        >
          {icon}
        </span>
      ) : (
        <span
          className={cn(
            "size-2.5 rounded-full",
            override ? fillClass : palette.markerFill,
          )}
        />
      )}
    </span>
  );
}

type ConnectorProps = {
  orientation: TimelineOrientation;
  status: TimelineItemStatus;
};

function Connector({ orientation, status }: ConnectorProps): ReactNode {
  const palette = STATUS_CLASSES[status];
  if (orientation === "horizontal") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-3 h-0 w-full border-t-2",
          palette.connector,
        )}
        style={{ left: "calc(50% + 0.75rem)" }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-3 top-6 h-full w-0 -translate-x-1/2 border-l-2",
        palette.connector,
      )}
    />
  );
}

type ItemBodyProps = {
  children?: ReactNode;
  date?: ReactNode;
  description?: ReactNode;
  orientation: TimelineOrientation;
  statusLabel: string;
  title: ReactNode;
};

function ItemBody({
  children,
  date,
  description,
  orientation,
  statusLabel,
  title,
}: ItemBodyProps): ReactNode {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-0.5",
        orientation === "horizontal" ? "items-center text-center" : "",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
          orientation === "horizontal" ? "justify-center" : "",
        )}
      >
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </p>
        {statusLabel ? <span className="sr-only">{statusLabel}</span> : null}
        {date ? (
          <span className="font-mono text-xs text-muted-foreground">
            {date}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? (
        <div className="mt-1 text-sm text-foreground">{children}</div>
      ) : null}
    </div>
  );
}

/**
 * One row inside a {@link Timeline}. Renders the marker, connector, title,
 * date, description, and any rich-content children.
 *
 * @public
 */
export const TimelineItem = ({
  ref,
  ...props
}: TimelineItemProps & { ref?: React.Ref<HTMLLIElement> }) => {
  const {
    children,
    className,
    color,
    date,
    description,
    icon,
    isLast = false,
    labels,
    status = "upcoming",
    title,
    ...rest
  } = props;
  const { labels: groupLabels, orientation } = use(TimelineContext);
  const statusLabel =
    labels?.[status] ?? groupLabels[status] ?? DEFAULT_LABELS[status];
  return (
    <li
      className={cn(
        "relative",
        orientation === "horizontal"
          ? "flex flex-1 flex-col items-center gap-2 px-3 pt-1"
          : "flex items-start gap-3 pb-6 last:pb-0",
        className,
      )}
      data-status={status}
      ref={ref}
      {...rest}
    >
      {isLast ? null : <Connector orientation={orientation} status={status} />}
      <Marker color={color} icon={icon} status={status} />
      <ItemBody
        date={date}
        description={description}
        orientation={orientation}
        statusLabel={statusLabel}
        title={title}
      >
        {children}
      </ItemBody>
    </li>
  );
};
TimelineItem.displayName = "TimelineItem";

export { timelineVariants };
