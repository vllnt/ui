"use client";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

const toneClasses = {
  amber: "bg-amber-500/20 text-amber-950 dark:text-amber-100",
  emerald: "bg-emerald-500/20 text-emerald-950 dark:text-emerald-100",
  rose: "bg-rose-500/20 text-rose-950 dark:text-rose-100",
  sky: "bg-sky-500/20 text-sky-950 dark:text-sky-100",
};

export type HighlightProps = {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof toneClasses;
};

export function Highlight({
  children,
  className,
  tone = "amber",
}: HighlightProps): ReactNode {
  return (
    <mark className={cn("rounded px-1 py-0.5", toneClasses[tone], className)}>
      {children}
    </mark>
  );
}

export type AnnotationProps = {
  annotation: ReactNode;
  children: ReactNode;
  className?: string;
  label?: string;
  tone?: keyof typeof toneClasses;
};

export function Annotation({
  annotation,
  children,
  className,
  label = "Annotation",
  tone = "amber",
}: AnnotationProps): ReactNode {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          type="button"
        >
          <Highlight tone={tone}>{children}</Highlight>
          <span className="text-[10px] font-semibold text-primary align-super">
            +
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-xs space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <div className="text-sm text-muted-foreground [&>p]:mb-2">
          {annotation}
        </div>
      </PopoverContent>
    </Popover>
  );
}
