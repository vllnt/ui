import type { Ref } from "react";
import type { View } from "react-native";

import { Badge, type BadgeProps } from "../badge/badge";

/** Account role represented by RoleBadge. */
export type RoleBadgeRole = "admin" | "billing" | "member" | "owner";

/** Props for the native account-role badge. */
export type RoleBadgeProps = Omit<
  BadgeProps,
  "children" | "ref" | "variant"
> & {
  readonly accountRole: RoleBadgeRole;
  readonly label?: string;
  readonly ref?: Ref<View>;
};

const roleLabels: Record<RoleBadgeRole, string> = {
  admin: "Admin",
  billing: "Billing",
  member: "Member",
  owner: "Owner",
};

const roleVariants: Record<
  RoleBadgeRole,
  NonNullable<BadgeProps["variant"]>
> = {
  admin: "default",
  billing: "secondary",
  member: "outline",
  owner: "default",
};

/** Compact native badge for an account role. */
function RoleBadge({
  accessibilityLabel,
  accountRole,
  label,
  ref,
  ...props
}: RoleBadgeProps) {
  const displayLabel = label ?? roleLabels[accountRole];

  return (
    <Badge
      {...props}
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessible
      ref={ref}
      variant={roleVariants[accountRole]}
    >
      {displayLabel}
    </Badge>
  );
}
RoleBadge.displayName = "RoleBadge";

export { RoleBadge };
