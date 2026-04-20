import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card/card";
import { PlanBadge, type PlanBadgeTier } from "../plan-badge/plan-badge";

export type SubscriptionCardStatus =
  | "active"
  | "canceled"
  | "past-due"
  | "trialing";

export type SubscriptionCardProps = React.ComponentPropsWithoutRef<
  typeof Card
> & {
  note?: string;
  plan: PlanBadgeTier;
  priceLabel: string;
  primaryActionLabel?: string;
  renewalLabel: string;
  seatsLabel?: string;
  secondaryActionLabel?: string;
  status: SubscriptionCardStatus;
  usageLabel?: string;
};

type SubscriptionActionsProps = {
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
};

type SubscriptionDetailsProps = {
  note?: string;
  priceLabel: string;
  renewalLabel: string;
  seatsLabel?: string;
  usageLabel?: string;
};

function getStatusLabel(status: SubscriptionCardStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "canceled":
      return "Canceled";
    case "past-due":
      return "Past due";
    case "trialing":
      return "Trialing";
  }
}

function getStatusClasses(status: SubscriptionCardStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "canceled":
      return "bg-muted text-muted-foreground";
    case "past-due":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "trialing":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
}

function getPlanState(
  status: SubscriptionCardStatus,
): "current" | "legacy" | "trial" {
  switch (status) {
    case "active":
    case "past-due":
      return "current";
    case "canceled":
      return "legacy";
    case "trialing":
      return "trial";
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function SubscriptionDetails({
  note,
  priceLabel,
  renewalLabel,
  seatsLabel,
  usageLabel,
}: SubscriptionDetailsProps) {
  return (
    <CardContent className="space-y-4">
      <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Monthly total
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {priceLabel}
        </p>
      </div>
      <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-4">
        <DetailRow label="Renewal" value={renewalLabel} />
        {seatsLabel ? <DetailRow label="Seats" value={seatsLabel} /> : null}
        {usageLabel ? <DetailRow label="Usage" value={usageLabel} /> : null}
      </div>
      {note ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          {note}
        </p>
      ) : null}
    </CardContent>
  );
}

function SubscriptionActions({
  primaryActionLabel,
  secondaryActionLabel,
}: SubscriptionActionsProps) {
  if (!primaryActionLabel && !secondaryActionLabel) {
    return null;
  }

  return (
    <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      {secondaryActionLabel ? (
        <Button className="w-full sm:w-auto" variant="outline">
          {secondaryActionLabel}
        </Button>
      ) : null}
      {primaryActionLabel ? (
        <Button className="w-full sm:w-auto">{primaryActionLabel}</Button>
      ) : null}
    </CardFooter>
  );
}

export const SubscriptionCard = React.forwardRef<
  React.ComponentRef<typeof Card>,
  SubscriptionCardProps
>(
  (
    {
      className,
      note,
      plan,
      priceLabel,
      primaryActionLabel,
      renewalLabel,
      seatsLabel,
      secondaryActionLabel,
      status,
      usageLabel,
      ...props
    },
    reference,
  ) => {
    return (
      <Card
        className={cn(
          "w-full max-w-md border-border/70 bg-card shadow-sm",
          className,
        )}
        ref={reference}
        {...props}
      >
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg">Subscription</CardTitle>
              <CardDescription>
                Billing overview for the current workspace plan.
              </CardDescription>
            </div>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                getStatusClasses(status),
              )}
            >
              {getStatusLabel(status)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Current plan</p>
              <p className="text-xs text-muted-foreground">{renewalLabel}</p>
            </div>
            <PlanBadge state={getPlanState(status)} tier={plan} />
          </div>
        </CardHeader>
        <SubscriptionDetails
          note={note}
          priceLabel={priceLabel}
          renewalLabel={renewalLabel}
          seatsLabel={seatsLabel}
          usageLabel={usageLabel}
        />
        <SubscriptionActions
          primaryActionLabel={primaryActionLabel}
          secondaryActionLabel={secondaryActionLabel}
        />
      </Card>
    );
  },
);

SubscriptionCard.displayName = "SubscriptionCard";
