import * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import { Badge, type BadgeProps } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../atoms/card/card";
import {
  PlanBadge,
  type PlanBadgeTier,
} from "../../molecules/plan-badge/plan-badge";

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

function getStatusTone(status: SubscriptionCardStatus): BadgeProps["tone"] {
  switch (status) {
    case "active":
      return "success";
    case "canceled":
      return "neutral";
    case "past-due":
      return "warning";
    case "trialing":
      return "info";
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
      <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
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

export const SubscriptionCard = /* @__PURE__ */ named(
  "SubscriptionCard",
  ({
    className,
    note,
    plan,
    priceLabel,
    primaryActionLabel,
    ref: reference,
    renewalLabel,
    seatsLabel,
    secondaryActionLabel,
    status,
    usageLabel,
    ...props
  }: SubscriptionCardProps & {
    ref?: React.Ref<React.ComponentRef<typeof Card>>;
  }) => {
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
            <Badge
              className="shrink-0 whitespace-nowrap py-1 font-medium hover:bg-secondary"
              dot
              tone={getStatusTone(status)}
            >
              {getStatusLabel(status)}
            </Badge>
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
