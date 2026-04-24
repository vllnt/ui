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
import {
  CreditBadge,
  type CreditBadgeStatus,
} from "../credit-badge/credit-badge";

export type WalletCardProps = React.ComponentPropsWithoutRef<typeof Card> & {
  availableLabel?: string;
  balanceLabel: string;
  note?: string;
  pendingLabel?: string;
  primaryActionLabel?: string;
  renewsLabel?: string;
  secondaryActionLabel?: string;
  status: CreditBadgeStatus;
};

type WalletActionsProps = {
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
};

type WalletDetailsProps = {
  availableLabel?: string;
  balanceLabel: string;
  note?: string;
  pendingLabel?: string;
  renewsLabel?: string;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function WalletDetails({
  availableLabel,
  balanceLabel,
  note,
  pendingLabel,
  renewsLabel,
}: WalletDetailsProps) {
  return (
    <CardContent className="space-y-4">
      <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Current balance
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {balanceLabel}
        </p>
      </div>
      <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-4">
        {availableLabel ? (
          <DetailRow label="Available now" value={availableLabel} />
        ) : null}
        {pendingLabel ? (
          <DetailRow label="Pending" value={pendingLabel} />
        ) : null}
        {renewsLabel ? <DetailRow label="Refresh" value={renewsLabel} /> : null}
      </div>
      {note ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          {note}
        </p>
      ) : null}
    </CardContent>
  );
}

function WalletActions({
  primaryActionLabel,
  secondaryActionLabel,
}: WalletActionsProps) {
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

export const WalletCard = React.forwardRef<
  React.ComponentRef<typeof Card>,
  WalletCardProps
>(
  (
    {
      availableLabel,
      balanceLabel,
      className,
      note,
      pendingLabel,
      primaryActionLabel,
      renewsLabel,
      secondaryActionLabel,
      status,
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
          <div className="space-y-1">
            <CardTitle className="text-lg">Wallet</CardTitle>
            <CardDescription>
              Track credits, pending top-ups, and replenishment timing.
            </CardDescription>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Available balance</p>
              <p className="text-xs text-muted-foreground">
                {renewsLabel ?? "Credits refresh automatically when enabled."}
              </p>
            </div>
            <CreditBadge amount={balanceLabel} status={status} />
          </div>
        </CardHeader>
        <WalletDetails
          availableLabel={availableLabel}
          balanceLabel={balanceLabel}
          note={note}
          pendingLabel={pendingLabel}
          renewsLabel={renewsLabel}
        />
        <WalletActions
          primaryActionLabel={primaryActionLabel}
          secondaryActionLabel={secondaryActionLabel}
        />
      </Card>
    );
  },
);

WalletCard.displayName = "WalletCard";
