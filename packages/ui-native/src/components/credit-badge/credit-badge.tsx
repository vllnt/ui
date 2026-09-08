import type { Ref } from "react";
import type { View } from "react-native";

import { Badge, type BadgeProps } from "../badge/badge";

/** Credit account state represented by CreditBadge. */
export type CreditBadgeStatus = "depleted" | "healthy" | "low" | "overdue";

/** Props for the native credit status badge. */
export type CreditBadgeProps = Omit<
  BadgeProps,
  "children" | "ref" | "variant"
> & {
  readonly amount?: string;
  readonly label?: string;
  readonly ref?: Ref<View>;
  readonly status: CreditBadgeStatus;
};

const statusLabels: Record<CreditBadgeStatus, string> = {
  depleted: "No credits left",
  healthy: "Credits available",
  low: "Credits running low",
  overdue: "Balance overdue",
};

const statusVariants: Record<
  CreditBadgeStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  depleted: "secondary",
  healthy: "default",
  low: "outline",
  overdue: "destructive",
};

/** Compact native badge for a credit balance and its semantic state. */
function CreditBadge({
  accessibilityLabel,
  amount,
  label,
  ref,
  status,
  ...props
}: CreditBadgeProps) {
  const statusLabel = label ?? statusLabels[status];
  const displayLabel = amount ? `${amount} • ${statusLabel}` : statusLabel;

  return (
    <Badge
      {...props}
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessible
      ref={ref}
      variant={statusVariants[status]}
    >
      {displayLabel}
    </Badge>
  );
}
CreditBadge.displayName = "CreditBadge";

export { CreditBadge };
