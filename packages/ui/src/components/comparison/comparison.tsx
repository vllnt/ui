"use client";

import { ArrowRight, Check, Minus, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

type ComparisonSide = {
  items: string[];
  title: string;
  variant?: "bad" | "good" | "neutral";
};

export type ComparisonProps = {
  after: ComparisonSide;
  before: ComparisonSide;
  title?: string;
};

const variantConfig = {
  bad: {
    className: "border-red-500/30 bg-red-500/5",
    headerClass: "bg-red-500/10 text-red-700 dark:text-red-300",
    icon: X,
    iconClass: "text-red-500",
  },
  good: {
    className: "border-green-500/30 bg-green-500/5",
    headerClass: "bg-green-500/10 text-green-700 dark:text-green-300",
    icon: Check,
    iconClass: "text-green-500",
  },
  neutral: {
    className: "border-border bg-muted/30",
    headerClass: "bg-muted text-muted-foreground",
    icon: Minus,
    iconClass: "text-muted-foreground",
  },
};

export function Comparison({ after, before, title }: ComparisonProps) {
  const beforeConfig = variantConfig[before.variant || "bad"];
  const afterConfig = variantConfig[after.variant || "good"];
  const BeforeIcon = beforeConfig.icon;
  const AfterIcon = afterConfig.icon;

  return (
    <div className="my-6">
      {title ? <h4 className="font-semibold mb-3">{title}</h4> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cn("rounded-lg border", beforeConfig.className)}>
          <div
            className={cn(
              "px-4 py-2 rounded-t-lg font-medium text-sm",
              beforeConfig.headerClass,
            )}
          >
            {before.title}
          </div>
          <ul className="p-4 space-y-2">
            {before.items.map((item, index) => (
              <li className="flex items-start gap-2 text-sm" key={index}>
                <BeforeIcon
                  className={cn(
                    "h-4 w-4 mt-0.5 flex-shrink-0",
                    beforeConfig.iconClass,
                  )}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cn("rounded-lg border", afterConfig.className)}>
          <div
            className={cn(
              "px-4 py-2 rounded-t-lg font-medium text-sm",
              afterConfig.headerClass,
            )}
          >
            {after.title}
          </div>
          <ul className="p-4 space-y-2">
            {after.items.map((item, index) => (
              <li className="flex items-start gap-2 text-sm" key={index}>
                <AfterIcon
                  className={cn(
                    "h-4 w-4 mt-0.5 flex-shrink-0",
                    afterConfig.iconClass,
                  )}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export type BeforeAfterProps = {
  after: ReactNode;
  before: ReactNode;
  title?: string;
};

export function BeforeAfter({ after, before, title }: BeforeAfterProps) {
  return (
    <div className="my-6">
      {title ? <h4 className="font-semibold mb-3">{title}</h4> : null}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 overflow-hidden">
          <div className="px-4 py-2 bg-red-500/10 text-red-700 dark:text-red-300 font-medium text-sm flex items-center gap-2">
            <X className="h-4 w-4" />
            Before
          </div>
          <div className="p-4 text-sm [&>pre]:my-0">{before}</div>
        </div>
        <div className="hidden md:flex items-center justify-center h-full">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 overflow-hidden">
          <div className="px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-300 font-medium text-sm flex items-center gap-2">
            <Check className="h-4 w-4" />
            After
          </div>
          <div className="p-4 text-sm [&>pre]:my-0">{after}</div>
        </div>
      </div>
    </div>
  );
}
