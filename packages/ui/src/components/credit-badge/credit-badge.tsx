import * as React from "react";

import { cn } from "../../lib/utils";
import { badgeVariants } from "../badge/badge";

export type CreditBadgeStatus = "depleted" | "healthy" | "low" | "overdue";

export type CreditBadgeProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "children"
> & {
  amount?: string;
  label?: string;
  status: CreditBadgeStatus;
};

function getStatusLabel(status: CreditBadgeStatus): string {
  switch (status) {
    case "depleted":
      return "No credits left";
    case "healthy":
      return "Credits available";
    case "low":
      return "Credits running low";
    case "overdue":
      return "Balance overdue";
  }
}

function getStatusClasses(status: CreditBadgeStatus): string {
  switch (status) {
    case "depleted":
      return "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300";
    case "healthy":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "low":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "overdue":
      return "border-destructive/30 bg-destructive/10 text-destructive";
  }
}

export const CreditBadge = React.forwardRef<HTMLSpanElement, CreditBadgeProps>(
  ({ amount, className, label, status, ...props }, reference) => {
    return (
      <span
        className={cn(
          badgeVariants({ variant: "outline" }),
          "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-none",
          getStatusClasses(status),
          className,
        )}
        ref={reference}
        {...props}
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
        <span>
          {amount
            ? `${amount} • ${label ?? getStatusLabel(status)}`
            : (label ?? getStatusLabel(status))}
        </span>
      </span>
    );
  },
);

CreditBadge.displayName = "CreditBadge";
