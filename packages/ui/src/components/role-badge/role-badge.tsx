import * as React from "react";

import { cn } from "../../lib/utils";
import { badgeVariants } from "../badge/badge";

export type RoleBadgeRole = "admin" | "billing" | "member" | "owner";

export type RoleBadgeProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "children"
> & {
  accountRole: RoleBadgeRole;
  label?: string;
};

function getRoleLabel(accountRole: RoleBadgeRole): string {
  switch (accountRole) {
    case "admin":
      return "Admin";
    case "billing":
      return "Billing";
    case "member":
      return "Member";
    case "owner":
      return "Owner";
  }
}

function getRoleClasses(accountRole: RoleBadgeRole): string {
  switch (accountRole) {
    case "admin":
      return "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case "billing":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "member":
      return "border-border bg-muted text-muted-foreground";
    case "owner":
      return "border-primary/30 bg-primary/10 text-primary";
  }
}

export const RoleBadge = React.forwardRef<HTMLSpanElement, RoleBadgeProps>(
  ({ accountRole, className, label, ...props }, reference) => {
    return (
      <span
        className={cn(
          badgeVariants({ variant: "outline" }),
          "rounded-full px-2.5 py-1 text-[11px] font-medium shadow-none",
          getRoleClasses(accountRole),
          className,
        )}
        ref={reference}
        {...props}
      >
        {label ?? getRoleLabel(accountRole)}
      </span>
    );
  },
);

RoleBadge.displayName = "RoleBadge";
