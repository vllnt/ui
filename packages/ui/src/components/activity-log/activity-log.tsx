"use client";

import { forwardRef, useMemo, useState } from "react";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { ScrollArea } from "../scroll-area";
import { Separator } from "../separator";

export type ActivityLogTone = "danger" | "default" | "success" | "warning";

export type ActivityLogItem = {
  action: string;
  actor: string;
  description?: string;
  id: string;
  scope?: string;
  target?: string;
  timestamp: string;
  tone?: ActivityLogTone;
};

export type ActivityLogProps = React.ComponentPropsWithoutRef<typeof Card> & {
  defaultPage?: number;
  description?: string;
  emptyMessage?: string;
  items: ActivityLogItem[];
  onPageChange?: (page: number) => void;
  page?: number;
  pageSize?: number;
  title?: string;
};

type ActivityToneConfig = {
  badgeClassName: string;
  markerClassName: string;
};

type ActivityRowProps = {
  item: ActivityLogItem;
};

type PaginationControlsProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageNumbers: number[];
  totalPages: number;
};

const toneConfig: Record<ActivityLogTone, ActivityToneConfig> = {
  danger: {
    badgeClassName:
      "border-destructive/20 bg-destructive/10 text-destructive dark:text-destructive",
    markerClassName: "bg-destructive",
  },
  default: {
    badgeClassName: "border-border bg-muted text-muted-foreground",
    markerClassName: "bg-primary",
  },
  success: {
    badgeClassName:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    markerClassName: "bg-emerald-500",
  },
  warning: {
    badgeClassName:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    markerClassName: "bg-amber-500",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildPageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 1) return [1];

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, start + 2);
  const normalizedStart = Math.max(1, end - 2);

  return Array.from(
    { length: end - normalizedStart + 1 },
    (_, index) => normalizedStart + index,
  );
}

function ActivityLogHeader({
  currentPage,
  description,
  title,
  totalPages,
}: {
  currentPage: number;
  description?: string;
  title: string;
  totalPages: number;
}) {
  return (
    <CardHeader>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        <Badge className="w-fit" variant="outline">
          Page {currentPage} of {totalPages}
        </Badge>
      </div>
    </CardHeader>
  );
}

function PaginationControls({
  currentPage,
  onPageChange,
  pageNumbers,
  totalPages,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        disabled={currentPage === 1}
        onClick={() => {
          onPageChange(currentPage - 1);
        }}
        size="sm"
        variant="outline"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      {pageNumbers.map((pageNumber) => (
        <Button
          aria-label={`Go to page ${pageNumber}`}
          key={pageNumber}
          onClick={() => {
            onPageChange(pageNumber);
          }}
          size="sm"
          variant={pageNumber === currentPage ? "default" : "outline"}
        >
          {pageNumber}
        </Button>
      ))}
      <Button
        disabled={currentPage === totalPages}
        onClick={() => {
          onPageChange(currentPage + 1);
        }}
        size="sm"
        variant="outline"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ActivityRow({ item }: ActivityRowProps) {
  const palette = toneConfig[item.tone ?? "default"];

  return (
    <li className="relative pl-12">
      <span
        aria-hidden="true"
        className="absolute bottom-[-1.5rem] left-[18px] top-11 w-px bg-border last:hidden"
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-4 top-3 h-3 w-3 rounded-full ring-4 ring-background",
          palette.markerClassName,
        )}
      />
      <div className="rounded-lg border bg-background/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar className="h-9 w-9 border bg-muted">
              <AvatarFallback>{getInitials(item.actor)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">
                  {item.actor}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {item.action}
                </span>
                {item.target ? (
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.target}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {item.scope ? (
              <Badge className={palette.badgeClassName} variant="outline">
                {item.scope}
              </Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {item.timestamp}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function ActivityLogBody({
  currentPage,
  emptyMessage,
  items,
  onPageChange,
  pageNumbers,
  pageSize,
  totalPages,
}: {
  currentPage: number;
  emptyMessage: string;
  items: ActivityLogItem[];
  onPageChange: (page: number) => void;
  pageNumbers: number[];
  pageSize: number;
  totalPages: number;
}) {
  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="max-h-[26rem] pr-4">
        <ol className="space-y-4 pb-2">
          {visibleItems.map((item) => (
            <ActivityRow item={item} key={item.id} />
          ))}
        </ol>
      </ScrollArea>
      <Separator />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1}
          {" - "}
          {(currentPage - 1) * pageSize + visibleItems.length} of {items.length}
        </p>
        <PaginationControls
          currentPage={currentPage}
          onPageChange={onPageChange}
          pageNumbers={pageNumbers}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}

const ActivityLog = forwardRef<HTMLDivElement, ActivityLogProps>(
  (
    {
      className,
      defaultPage = 1,
      description,
      emptyMessage = "No activity recorded yet.",
      items,
      onPageChange,
      page,
      pageSize = 5,
      title = "Activity log",
      ...props
    },
    ref,
  ) => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
    const currentPage = Math.min(
      Math.max(page ?? uncontrolledPage, 1),
      totalPages,
    );
    const pageNumbers = useMemo(
      () => buildPageNumbers(currentPage, totalPages),
      [currentPage, totalPages],
    );

    function handlePageChange(nextPage: number) {
      if (page === undefined) {
        setUncontrolledPage(nextPage);
      }
      onPageChange?.(nextPage);
    }

    return (
      <Card className={cn("w-full", className)} ref={ref} {...props}>
        <ActivityLogHeader
          currentPage={currentPage}
          description={description}
          title={title}
          totalPages={totalPages}
        />
        <CardContent className="space-y-4">
          <ActivityLogBody
            currentPage={currentPage}
            emptyMessage={emptyMessage}
            items={items}
            onPageChange={handlePageChange}
            pageNumbers={pageNumbers}
            pageSize={pageSize}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    );
  },
);

ActivityLog.displayName = "ActivityLog";

export { ActivityLog };
