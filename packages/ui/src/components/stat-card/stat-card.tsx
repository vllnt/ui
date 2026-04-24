import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader } from "../card";

const statCardVariants = cva("overflow-hidden border shadow-sm", {
  defaultVariants: {
    tone: "neutral",
  },
  variants: {
    tone: {
      danger: "border-red-200/70 dark:border-red-950/70",
      neutral: "",
      success: "border-emerald-200/70 dark:border-emerald-950/70",
      warning: "border-amber-200/70 dark:border-amber-950/70",
    },
  },
});

const accentVariants = cva("h-1 w-full", {
  defaultVariants: {
    tone: "neutral",
  },
  variants: {
    tone: {
      danger: "bg-red-500/80",
      neutral: "bg-primary/70",
      success: "bg-emerald-500/80",
      warning: "bg-amber-500/80",
    },
  },
});

const changeVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium",
  {
    defaultVariants: {
      trend: "neutral",
    },
    variants: {
      trend: {
        down: "text-red-600 dark:text-red-400",
        neutral: "text-muted-foreground",
        up: "text-emerald-600 dark:text-emerald-400",
      },
    },
  },
);

type StatCardTrend = "down" | "neutral" | "up";

export type StatCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof statCardVariants> & {
    change?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    label: React.ReactNode;
    meta?: React.ReactNode;
    trend?: StatCardTrend;
    value: React.ReactNode;
  };

function TrendIcon({ trend }: { trend: StatCardTrend }) {
  if (trend === "up") {
    return <ArrowUpRight className="h-3.5 w-3.5" />;
  }

  if (trend === "down") {
    return <ArrowDownRight className="h-3.5 w-3.5" />;
  }

  return <ArrowRight className="h-3.5 w-3.5" />;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      change,
      className,
      description,
      icon,
      label,
      meta,
      tone,
      trend = "neutral",
      value,
      ...props
    },
    reference,
  ) => (
    <Card
      className={cn(statCardVariants({ tone }), className)}
      ref={reference}
      {...props}
    >
      <div className={accentVariants({ tone })} />
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-1">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.14em]">
            {label}
          </CardDescription>
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        {icon ? (
          <div className="rounded-lg border bg-muted/50 p-2 text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      {description || change || meta ? (
        <CardContent className="space-y-3">
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          {change || meta ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {change ? (
                <div className={changeVariants({ trend })}>
                  <TrendIcon trend={trend} />
                  <span>{change}</span>
                </div>
              ) : null}
              {meta ? (
                <div className="text-xs text-muted-foreground">{meta}</div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  ),
);

StatCard.displayName = "StatCard";

export { StatCard, statCardVariants };
