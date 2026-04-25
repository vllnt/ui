import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

export type SeverityBadgeLevel =
  | "critical"
  | "high"
  | "info"
  | "low"
  | "medium";

const severityBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    compoundVariants: [
      {
        className:
          "border-transparent bg-destructive text-destructive-foreground",
        level: "critical",
        tone: "solid",
      },
      {
        className: "border-destructive/30 bg-destructive/10 text-destructive",
        level: "critical",
        tone: "soft",
      },
      {
        className: "border-destructive/40 text-destructive",
        level: "critical",
        tone: "outline",
      },
      {
        className: "border-transparent bg-orange-500 text-white",
        level: "high",
        tone: "solid",
      },
      {
        className: "border-orange-500/30 bg-orange-500/10 text-orange-600",
        level: "high",
        tone: "soft",
      },
      {
        className: "border-orange-500/40 text-orange-600",
        level: "high",
        tone: "outline",
      },
      {
        className: "border-transparent bg-amber-500 text-white",
        level: "medium",
        tone: "solid",
      },
      {
        className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
        level: "medium",
        tone: "soft",
      },
      {
        className: "border-amber-500/40 text-amber-600",
        level: "medium",
        tone: "outline",
      },
      {
        className: "border-transparent bg-sky-500 text-white",
        level: "low",
        tone: "solid",
      },
      {
        className: "border-sky-500/30 bg-sky-500/10 text-sky-600",
        level: "low",
        tone: "soft",
      },
      {
        className: "border-sky-500/40 text-sky-600",
        level: "low",
        tone: "outline",
      },
      {
        className: "border-transparent bg-muted text-muted-foreground",
        level: "info",
        tone: "solid",
      },
      {
        className: "border-border bg-muted/50 text-muted-foreground",
        level: "info",
        tone: "soft",
      },
      {
        className: "border-border text-muted-foreground",
        level: "info",
        tone: "outline",
      },
    ],
    defaultVariants: {
      level: "info",
      tone: "soft",
    },
    variants: {
      level: {
        critical: "",
        high: "",
        info: "",
        low: "",
        medium: "",
      },
      tone: {
        outline: "",
        soft: "",
        solid: "",
      },
    },
  },
);

const DOT_COLOR: Record<SeverityBadgeLevel, string> = {
  critical: "bg-destructive",
  high: "bg-orange-500",
  info: "bg-muted-foreground",
  low: "bg-sky-500",
  medium: "bg-amber-500",
};

const DEFAULT_LABEL: Record<SeverityBadgeLevel, string> = {
  critical: "Critical",
  high: "High",
  info: "Info",
  low: "Low",
  medium: "Medium",
};

export type SeverityBadgeProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  VariantProps<typeof severityBadgeVariants> & {
    children?: React.ReactNode;
    level: SeverityBadgeLevel;
    pulse?: boolean;
    showDot?: boolean;
  };

function SeverityBadge({
  children,
  className,
  level,
  pulse = false,
  showDot = true,
  tone,
  ...props
}: SeverityBadgeProps) {
  const label = children ?? DEFAULT_LABEL[level];

  return (
    <span
      className={cn(severityBadgeVariants({ level, tone }), className)}
      data-level={level}
      {...props}
    >
      {showDot ? (
        <span aria-hidden="true" className="relative flex h-2 w-2">
          {pulse ? (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                DOT_COLOR[level],
              )}
            />
          ) : null}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              DOT_COLOR[level],
            )}
          />
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}

export { SeverityBadge, severityBadgeVariants };
