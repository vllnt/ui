"use client";

import * as React from "react";

import { cva } from "class-variance-authority";

import { cn } from "../../../lib/utils";
import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { Checkbox } from "../../atoms/checkbox/checkbox";
import { Label } from "../../atoms/label/label";

/** How much damage the requested action can do if it goes wrong. */
export type ApprovalRequestRisk = "high" | "low" | "medium";

/** Where the request stands. A `pending` request takes a decision; the others are final. */
export type ApprovalRequestStatus =
  | "approved"
  | "denied"
  | "expired"
  | "pending";

/**
 * Surface treatment. It changes the look and nothing else: the host supplies
 * any Dialog, overlay or positioning.
 */
export type ApprovalRequestPlacement = "dialog" | "hud" | "inline";

/** Optional "remember my choice" checkbox shown while the request is pending. */
export type ApprovalRequestRemember = {
  /** Controlled value. Leave it out to let the checkbox keep its own state. */
  checked?: boolean;
  /** Visible text next to the checkbox. A blank value shows `Remember my choice`. */
  label: string;
  /** Called with the new value when the user toggles the checkbox. */
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * Visible words. Every key is optional: a missing or blank entry falls back to
 * the English default, so a risk or status is never shown without a word.
 */
export type ApprovalRequestLabels = {
  /** Text of the approve button. Default `Approve`. */
  approve?: string;
  /** Text of the deny button. Default `Deny`. */
  deny?: string;
  /** Risk words. Defaults `Low risk`, `Medium risk`, `High risk`. */
  risk?: Partial<Record<ApprovalRequestRisk, string>>;
  /** Status words. Defaults `Pending`, `Approved`, `Denied`, `Expired`. */
  status?: Partial<Record<ApprovalRequestStatus, string>>;
};

export type ApprovalRequestProps = Omit<
  React.ComponentPropsWithoutRef<"fieldset">,
  "children" | "title"
> & {
  /** What the request asks for, shown in a monospace block (a command, a path, a URL). */
  action: string;
  /** Extra context under the title. */
  detail?: string;
  /** Visible words for the badges and buttons. English defaults. */
  labels?: ApprovalRequestLabels;
  /** Called when the user clicks Approve. The button exists while `status` is `pending`. */
  onApprove: () => void;
  /** Called when the user clicks Deny. The button exists while `status` is `pending`. */
  onDeny: () => void;
  /** Surface treatment. Default `inline`. */
  placement?: ApprovalRequestPlacement;
  /** Adds a "remember my choice" checkbox while the request is pending. */
  remember?: ApprovalRequestRemember;
  /** Risk of the requested action. Default `low`. */
  risk?: ApprovalRequestRisk;
  /** Request status. Default `pending`. */
  status?: ApprovalRequestStatus;
  /** Short name of the request. Labels the group. */
  title: string;
};

type ApprovalRequestFooterProps = {
  approveLabel: string;
  denyLabel: string;
  onApprove: () => void;
  onDeny: () => void;
};

const DEFAULT_APPROVE_LABEL = "Approve";
const DEFAULT_DENY_LABEL = "Deny";
const DEFAULT_REMEMBER_LABEL = "Remember my choice";

const DEFAULT_RISK_LABELS: Record<ApprovalRequestRisk, string> = {
  high: "High risk",
  low: "Low risk",
  medium: "Medium risk",
};

const DEFAULT_STATUS_LABELS: Record<ApprovalRequestStatus, string> = {
  approved: "Approved",
  denied: "Denied",
  expired: "Expired",
  pending: "Pending",
};

const surfaceVariants = cva(
  "flex w-full min-w-0 flex-col gap-3 border text-sm",
  {
    defaultVariants: {
      placement: "inline",
    },
    variants: {
      placement: {
        dialog:
          "max-w-lg gap-4 rounded-lg bg-background p-6 text-foreground shadow-lg",
        hud: "max-w-sm rounded-md bg-popover p-3 text-popover-foreground shadow-md",
        inline: "rounded-lg bg-card p-4 text-card-foreground",
      },
    },
  },
);

const riskVariants = cva("", {
  defaultVariants: {
    risk: "low",
  },
  variants: {
    risk: {
      high: "border-destructive/40 bg-destructive/10 text-destructive",
      low: "border-border bg-muted text-muted-foreground",
      medium: "border-warning/40 bg-warning/10 text-warning",
    },
  },
});

const statusVariants = cva("", {
  defaultVariants: {
    status: "pending",
  },
  variants: {
    status: {
      approved: "border-success/40 bg-success/10 text-success",
      denied: "border-destructive/40 bg-destructive/10 text-destructive",
      expired: "border-border bg-muted text-muted-foreground",
      pending: "border-info/40 bg-info/10 text-info",
    },
  },
});

function resolveLabel(custom: string | undefined, fallback: string): string {
  return custom !== undefined && custom.trim() !== "" ? custom : fallback;
}

function RememberRow({
  checked,
  label,
  onCheckedChange,
}: ApprovalRequestRemember): React.JSX.Element {
  const rememberId = React.useId();

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={checked}
        id={rememberId}
        onCheckedChange={(state) => {
          onCheckedChange?.(state === true);
        }}
      />
      <Label
        className="font-normal leading-snug text-muted-foreground"
        htmlFor={rememberId}
      >
        {resolveLabel(label, DEFAULT_REMEMBER_LABEL)}
      </Label>
    </div>
  );
}

function ApprovalRequestFooter({
  approveLabel,
  denyLabel,
  onApprove,
  onDeny,
}: ApprovalRequestFooterProps): React.JSX.Element {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button onClick={onDeny} type="button" variant="outline">
        {denyLabel}
      </Button>
      <Button onClick={onApprove} type="button">
        {approveLabel}
      </Button>
    </div>
  );
}

/**
 * Asks the user to approve or deny one action, such as an agent running a
 * command. It shows the risk and the status as words, the action in
 * monospace, and, while the request is pending, Approve and Deny buttons with
 * an optional "remember my choice" checkbox. Once the request reaches
 * approved, denied or expired, the buttons go away and the status word stays.
 *
 * The root is a `<fieldset>`, which exposes `role="group"` named by the title.
 * Passing `disabled` disables the buttons and the checkbox, for example while
 * the host sends the decision.
 *
 * @example
 * ```tsx
 * <ApprovalRequest
 *   action="rm -rf ./dist"
 *   onApprove={approve}
 *   onDeny={deny}
 *   risk="high"
 *   title="Delete build output"
 * />
 * ```
 */
export const ApprovalRequest = ({
  action,
  className,
  detail,
  labels,
  onApprove,
  onDeny,
  placement = "inline",
  ref: reference,
  remember,
  risk = "low",
  status = "pending",
  title,
  ...props
}: ApprovalRequestProps & { ref?: React.Ref<HTMLFieldSetElement> }) => {
  const titleId = React.useId();
  const isPending = status === "pending";

  return (
    <fieldset
      aria-labelledby={titleId}
      className={cn(surfaceVariants({ placement }), className)}
      ref={reference}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={riskVariants({ risk })} variant="outline">
          {resolveLabel(labels?.risk?.[risk], DEFAULT_RISK_LABELS[risk])}
        </Badge>
        <Badge
          className={statusVariants({ status })}
          role="status"
          variant="outline"
        >
          {resolveLabel(
            labels?.status?.[status],
            DEFAULT_STATUS_LABELS[status],
          )}
        </Badge>
      </div>
      <p className="text-base font-semibold leading-snug" id={titleId}>
        {title}
      </p>
      {detail ? <p className="text-muted-foreground">{detail}</p> : null}
      <code className="block whitespace-pre-wrap break-words rounded-md border bg-muted px-3 py-2 font-mono text-sm text-foreground">
        {action}
      </code>
      {isPending ? (
        <>
          <hr className="border-border" />
          {remember ? <RememberRow {...remember} /> : null}
          <ApprovalRequestFooter
            approveLabel={resolveLabel(labels?.approve, DEFAULT_APPROVE_LABEL)}
            denyLabel={resolveLabel(labels?.deny, DEFAULT_DENY_LABEL)}
            onApprove={onApprove}
            onDeny={onDeny}
          />
        </>
      ) : null}
    </fieldset>
  );
};

ApprovalRequest.displayName = "ApprovalRequest";
