import * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import { Badge, type BadgeProps } from "../../atoms/badge/badge";

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

function getStatusTone(status: CreditBadgeStatus): BadgeProps["tone"] {
  switch (status) {
    case "depleted":
      return "neutral";
    case "healthy":
      return "success";
    case "low":
      return "warning";
    case "overdue":
      return "danger";
  }
}

export const CreditBadge = /* @__PURE__ */ named(
  "CreditBadge",
  ({
    amount,
    className,
    label,
    ref: reference,
    status,
    ...props
  }: CreditBadgeProps & { ref?: React.Ref<HTMLSpanElement> }) => {
    return (
      <Badge
        className={cn(
          "py-1 text-[11px] font-medium shadow-none hover:bg-secondary",
          className,
        )}
        dot
        ref={reference}
        tone={getStatusTone(status)}
        {...props}
      >
        <span>
          {amount
            ? `${amount} • ${label ?? getStatusLabel(status)}`
            : (label ?? getStatusLabel(status))}
        </span>
      </Badge>
    );
  },
);
