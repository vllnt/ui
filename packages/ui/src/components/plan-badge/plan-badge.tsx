import * as React from "react";

import { cn } from "../../lib/utils";
import { badgeVariants } from "../badge/badge";

export type PlanBadgeTier = "enterprise" | "free" | "growth" | "starter";

export type PlanBadgeState = "current" | "legacy" | "trial";

export type PlanBadgeProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "children"
> & {
  label?: string;
  state?: PlanBadgeState;
  tier: PlanBadgeTier;
};

function getPlanLabel(tier: PlanBadgeTier): string {
  switch (tier) {
    case "enterprise":
      return "Enterprise";
    case "free":
      return "Free";
    case "growth":
      return "Growth";
    case "starter":
      return "Starter";
  }
}

function getPlanClasses(tier: PlanBadgeTier, state: PlanBadgeState): string {
  if (state === "legacy") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (state === "trial") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  switch (tier) {
    case "enterprise":
      return "border-primary/30 bg-primary/10 text-primary";
    case "free":
      return "border-border bg-muted text-muted-foreground";
    case "growth":
      return "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case "starter":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
}

export const PlanBadge = React.forwardRef<HTMLSpanElement, PlanBadgeProps>(
  ({ className, label, state = "current", tier, ...props }, reference) => {
    return (
      <span
        className={cn(
          badgeVariants({ variant: "outline" }),
          "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.02em] shadow-none",
          getPlanClasses(tier, state),
          className,
        )}
        ref={reference}
        {...props}
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
        <span>{label ?? getPlanLabel(tier)}</span>
        {state === "trial" ? (
          <span className="text-current/80">Trial</span>
        ) : null}
        {state === "legacy" ? (
          <span className="text-current/80">Legacy</span>
        ) : null}
      </span>
    );
  },
);

PlanBadge.displayName = "PlanBadge";
