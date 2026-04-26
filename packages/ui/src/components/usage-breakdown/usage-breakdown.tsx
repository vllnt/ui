"use client";

import { forwardRef, type ReactNode, useMemo } from "react";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

export type UsageBreakdownTone = "danger" | "default" | "success" | "warning";

export type UsageBreakdownItem = {
  description?: string;
  icon?: ReactNode;
  id: string;
  label: string;
  meta?: string;
  tone?: UsageBreakdownTone;
  trend?: {
    direction: "down" | "up";
    label: string;
  };
  value: number;
  valueLabel?: string;
};

export type UsageBreakdownProps = React.ComponentPropsWithoutRef<
  typeof Card
> & {
  description?: string;
  emptyMessage?: string;
  items: UsageBreakdownItem[];
  maxItems?: number;
  title?: string;
};

type UsageBreakdownRowProps = {
  item: UsageBreakdownItem;
  maxValue: number;
  rank: number;
  totalValue: number;
};

const toneClasses: Record<UsageBreakdownTone, string> = {
  danger:
    "bg-destructive/10 text-destructive border-destructive/20 dark:text-destructive",
  default: "bg-muted text-muted-foreground border-border",
  success:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
};

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function formatValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function getRelativeWidth(value: number, maxValue: number): number {
  if (maxValue <= 0) return 0;
  return Math.max((value / maxValue) * 100, 4);
}

function getShare(value: number, totalValue: number): number {
  if (totalValue <= 0) return 0;
  return (value / totalValue) * 100;
}

function UsageBreakdownTrend({ item }: { item: UsageBreakdownItem }) {
  if (!item.trend) return null;

  const trendTone = item.tone ?? "default";
  const TrendIcon =
    item.trend.direction === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <Badge className={cn("gap-1 border", toneClasses[trendTone])}>
      <TrendIcon className="h-3.5 w-3.5" />
      {item.trend.label}
    </Badge>
  );
}

function UsageBreakdownMeter({
  maxValue,
  value,
}: {
  maxValue: number;
  value: number;
}) {
  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          aria-hidden="true"
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${getRelativeWidth(value, maxValue)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Relative usage</span>
        <span>{formatPercent(getShare(value, maxValue))}</span>
      </div>
    </div>
  );
}

function UsageBreakdownRow({
  item,
  maxValue,
  rank,
  totalValue,
}: UsageBreakdownRowProps) {
  return (
    <li className="rounded-lg border bg-background/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-semibold text-muted-foreground">
          {item.icon ?? rank}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium text-foreground">
                  {item.label}
                </span>
                {item.meta ? (
                  <Badge className="border-border" variant="outline">
                    {item.meta}
                  </Badge>
                ) : null}
                <UsageBreakdownTrend item={item} />
              </div>
              {item.description ? (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
            <div className="text-left sm:text-right">
              <div className="font-semibold text-foreground">
                {item.valueLabel ?? formatValue(item.value)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatPercent(getShare(item.value, totalValue))} of total
              </div>
            </div>
          </div>
          <UsageBreakdownMeter maxValue={maxValue} value={item.value} />
        </div>
      </div>
    </li>
  );
}

function getSortedItems(items: UsageBreakdownItem[], maxItems?: number) {
  const rankedItems = [...items].sort(
    (left, right) => right.value - left.value,
  );
  return typeof maxItems === "number"
    ? rankedItems.slice(0, maxItems)
    : rankedItems;
}

const UsageBreakdown = forwardRef<HTMLDivElement, UsageBreakdownProps>(
  (
    {
      className,
      description,
      emptyMessage = "No usage data available.",
      items,
      maxItems,
      title = "Usage breakdown",
      ...props
    },
    ref,
  ) => {
    const sortedItems = useMemo(
      () => getSortedItems(items, maxItems),
      [items, maxItems],
    );
    const totalValue = useMemo(
      () => sortedItems.reduce((sum, item) => sum + item.value, 0),
      [sortedItems],
    );
    const maxValue = sortedItems[0]?.value ?? 0;

    return (
      <Card className={cn("w-full", className)} ref={ref} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <ol className="space-y-3">
              {sortedItems.map((item, index) => (
                <UsageBreakdownRow
                  item={item}
                  key={item.id}
                  maxValue={maxValue}
                  rank={index + 1}
                  totalValue={totalValue}
                />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    );
  },
);

UsageBreakdown.displayName = "UsageBreakdown";

export { UsageBreakdown };
