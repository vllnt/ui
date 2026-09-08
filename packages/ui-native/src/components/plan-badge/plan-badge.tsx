import type { Ref } from "react";
import type { View } from "react-native";

import { Badge, type BadgeProps } from "../badge/badge";

/** Subscription tier represented by PlanBadge. */
export type PlanBadgeTier = "enterprise" | "free" | "growth" | "starter";
/** Subscription lifecycle state represented by PlanBadge. */
export type PlanBadgeState = "current" | "legacy" | "trial";

/** Props for the native plan badge. */
export type PlanBadgeProps = Omit<
  BadgeProps,
  "children" | "ref" | "variant"
> & {
  readonly label?: string;
  readonly ref?: Ref<View>;
  readonly state?: PlanBadgeState;
  readonly tier: PlanBadgeTier;
};

const tierLabels: Record<PlanBadgeTier, string> = {
  enterprise: "Enterprise",
  free: "Free",
  growth: "Growth",
  starter: "Starter",
};

function resolveVariant(
  tier: PlanBadgeTier,
  state: PlanBadgeState,
): NonNullable<BadgeProps["variant"]> {
  if (state === "legacy") return "outline";
  if (state === "trial") return "secondary";
  if (tier === "enterprise" || tier === "growth") return "default";
  if (tier === "starter") return "secondary";
  return "outline";
}

/** Compact native badge for plan tier and lifecycle state. */
function PlanBadge({
  accessibilityLabel,
  label,
  ref,
  state = "current",
  tier,
  ...props
}: PlanBadgeProps) {
  const baseLabel = label ?? tierLabels[tier];
  const displayLabel =
    state === "current"
      ? baseLabel
      : `${baseLabel} • ${state === "trial" ? "Trial" : "Legacy"}`;

  return (
    <Badge
      {...props}
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessible
      ref={ref}
      variant={resolveVariant(tier, state)}
    >
      {displayLabel}
    </Badge>
  );
}
PlanBadge.displayName = "PlanBadge";

export { PlanBadge };
