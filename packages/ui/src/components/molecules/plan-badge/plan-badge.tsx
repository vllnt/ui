import * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge, type BadgeProps } from "../../atoms/badge/badge";

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

function getPlanTone(
  tier: PlanBadgeTier,
  state: PlanBadgeState,
): BadgeProps["tone"] {
  if (state === "legacy") {
    return "warning";
  }

  if (state === "trial") {
    return "info";
  }

  switch (tier) {
    case "enterprise":
      return "primary";
    case "free":
      return "neutral";
    case "growth":
      return "info";
    case "starter":
      return "success";
  }
}

export const PlanBadge = ({
  className,
  label,
  ref: reference,
  state = "current",
  tier,
  ...props
}: PlanBadgeProps & { ref?: React.Ref<HTMLSpanElement> }) => {
  return (
    <Badge
      className={cn(
        "py-1 text-[11px] font-medium tracking-[0.02em] shadow-none hover:bg-secondary",
        className,
      )}
      dot
      ref={reference}
      tone={getPlanTone(tier, state)}
      {...props}
    >
      <span>{label ?? getPlanLabel(tier)}</span>
      {state === "trial" ? (
        <span className="text-current/80">Trial</span>
      ) : null}
      {state === "legacy" ? (
        <span className="text-current/80">Legacy</span>
      ) : null}
    </Badge>
  );
};

PlanBadge.displayName = "PlanBadge";
