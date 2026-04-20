import * as React from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

export type StatusBoardStatus =
  | "critical"
  | "healthy"
  | "maintenance"
  | "offline"
  | "warning";

export type StatusBoardItem = {
  description?: string;
  label: string;
  meta?: string;
  status: StatusBoardStatus;
  value?: string;
};

export type StatusBoardProps = React.ComponentPropsWithoutRef<"div"> & {
  columns?: 2 | 3 | 4;
  description?: string;
  items: StatusBoardItem[];
  title?: string;
};

type StatusMeta = {
  badgeVariant: "default" | "destructive" | "outline" | "secondary";
  dotClassName: string;
  label: string;
  panelClassName: string;
};

const STATUS_META: Record<StatusBoardStatus, StatusMeta> = {
  critical: {
    badgeVariant: "destructive",
    dotClassName: "bg-destructive",
    label: "Critical",
    panelClassName: "border-destructive/30 bg-destructive/5",
  },
  healthy: {
    badgeVariant: "default",
    dotClassName: "bg-emerald-500",
    label: "Healthy",
    panelClassName: "border-emerald-500/25 bg-emerald-500/5",
  },
  maintenance: {
    badgeVariant: "secondary",
    dotClassName: "bg-sky-500",
    label: "Maintenance",
    panelClassName: "border-sky-500/25 bg-sky-500/5",
  },
  offline: {
    badgeVariant: "outline",
    dotClassName: "bg-muted-foreground",
    label: "Offline",
    panelClassName: "border-border bg-muted/30",
  },
  warning: {
    badgeVariant: "secondary",
    dotClassName: "bg-amber-500",
    label: "Warning",
    panelClassName: "border-amber-500/25 bg-amber-500/5",
  },
};

const STATUS_ORDER: StatusBoardStatus[] = [
  "healthy",
  "warning",
  "critical",
  "maintenance",
  "offline",
];

function getColumnsClassName(columns: 2 | 3 | 4): string {
  if (columns === 2) {
    return "md:grid-cols-2";
  }

  if (columns === 4) {
    return "md:grid-cols-2 xl:grid-cols-4";
  }

  return "md:grid-cols-2 xl:grid-cols-3";
}

function getSummary(items: StatusBoardItem[]) {
  const counts = items.reduce<Record<StatusBoardStatus, number>>(
    (summary, item) => ({
      ...summary,
      [item.status]: summary[item.status] + 1,
    }),
    {
      critical: 0,
      healthy: 0,
      maintenance: 0,
      offline: 0,
      warning: 0,
    },
  );

  return STATUS_ORDER.map((status) => ({
    count: counts[status],
    status,
  })).filter((entry) => entry.count > 0);
}

function StatusBoardSummary({ items }: { items: StatusBoardItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {getSummary(items).map(({ count, status }) => {
        const meta = STATUS_META[status];

        return (
          <Badge key={status} variant={meta.badgeVariant}>
            {count} {meta.label}
          </Badge>
        );
      })}
    </div>
  );
}

function StatusBoardCard({ item }: { item: StatusBoardItem }) {
  const meta = STATUS_META[item.status];

  return (
    <Card className={cn("shadow-sm", meta.panelClassName)}>
      <CardHeader className="gap-3 space-y-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn("h-2.5 w-2.5 rounded-full", meta.dotClassName)}
              />
              <CardTitle className="text-base leading-none">
                {item.label}
              </CardTitle>
            </div>
            {item.description ? (
              <CardDescription>{item.description}</CardDescription>
            ) : null}
          </div>
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <div>
          {item.value ? (
            <div className="text-2xl font-semibold tracking-tight">
              {item.value}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No metric reported
            </div>
          )}
        </div>
        {item.meta ? (
          <div className="text-xs text-muted-foreground">{item.meta}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export const StatusBoard = React.forwardRef<HTMLDivElement, StatusBoardProps>(
  (
    {
      className,
      columns = 3,
      description,
      items,
      title = "Status board",
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("space-y-4", className)} ref={ref} {...props}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <StatusBoardSummary items={items} />
        </div>

        <div className={cn("grid gap-4", getColumnsClassName(columns))}>
          {items.map((item) => (
            <StatusBoardCard item={item} key={item.label} />
          ))}
        </div>
      </div>
    );
  },
);

StatusBoard.displayName = "StatusBoard";
