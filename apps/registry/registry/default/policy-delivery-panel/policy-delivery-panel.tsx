"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Enforcement status for a policy.
 *
 * @public
 */
export type PolicyStatus = "advisory" | "disabled" | "enforced";

const STATUS_LABEL: Record<PolicyStatus, string> = {
  advisory: "Advisory",
  disabled: "Disabled",
  enforced: "Enforced",
};

const STATUS_TONE: Record<PolicyStatus, string> = {
  advisory:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  disabled: "border-border bg-muted/40 text-muted-foreground",
  enforced:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

/**
 * One policy row.
 *
 * @public
 */
export type PolicyEntry = {
  /** Optional secondary line (rationale, owner, last-updated). */
  description?: ReactNode;
  /** Stable identifier — used as the React key. */
  id: string;
  /** Display name (e.g. `"PII redaction"`). */
  name: ReactNode;
  /** Optional toggle handler — when provided, the row becomes a button. */
  onToggle?: () => void;
  /** Enforcement status. */
  status: PolicyStatus;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PolicyDeliveryPanelLabels = {
  /** Empty-state copy. Defaults to `"No policies"`. */
  empty?: string;
  /** Aria-label for the panel. Defaults to `"Policy delivery"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No policies",
  region: "Policy delivery",
} as const satisfies Required<PolicyDeliveryPanelLabels>;

/**
 * Props for {@link PolicyDeliveryPanel}.
 *
 * @public
 */
export type PolicyDeliveryPanelProps = {
  /** Localizable strings. */
  labels?: PolicyDeliveryPanelLabels;
  /** Policy entries in render order. */
  policies: PolicyEntry[];
  /** Panel title. Defaults to `"Policies"`. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const RowBody = (props: { policy: PolicyEntry }): React.ReactElement => {
  const { policy } = props;
  return (
    <span className="flex flex-1 flex-col gap-0.5 text-left">
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-foreground">
          {policy.name}
        </span>
        <span
          className={cn(
            "rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
            STATUS_TONE[policy.status],
          )}
        >
          {STATUS_LABEL[policy.status]}
        </span>
      </span>
      {policy.description ? (
        <span className="truncate text-[10px] text-muted-foreground">
          {policy.description}
        </span>
      ) : null}
    </span>
  );
};

const Row = (props: { policy: PolicyEntry }): React.ReactElement => {
  const { policy } = props;
  if (policy.onToggle) {
    const handleClick = (): void => {
      policy.onToggle?.();
    };
    return (
      <button
        className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-policy-row={policy.id}
        data-policy-status={policy.status}
        onClick={handleClick}
        type="button"
      >
        <RowBody policy={policy} />
      </button>
    );
  }
  return (
    <div
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5"
      data-policy-row={policy.id}
      data-policy-status={policy.status}
    >
      <RowBody policy={policy} />
    </div>
  );
};

/**
 * Right-dock panel listing the policies / guardrails that apply to the
 * active route or run. Each row shows the policy name, enforcement
 * status chip, and optional rationale. Pure presentation; the host
 * computes the policy list from the live config and supplies an
 * optional toggle handler for admin views.
 *
 * @example
 * ```tsx
 * <PolicyDeliveryPanel
 *   policies={[
 *     { id: "pii",  name: "PII redaction", status: "enforced" },
 *     { id: "rate", name: "Rate limiting", status: "advisory", description: "60 / s soft cap" },
 *     { id: "exp",  name: "Experiment B",  status: "disabled" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const PolicyDeliveryPanel = (
  props: PolicyDeliveryPanelProps & React.RefAttributes<HTMLElement>,
) => {
  const {
    className,
    labels,
    policies,
    ref,
    title = "Policies",
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border bg-background p-3 text-foreground",
        className,
      )}
      data-policy-delivery-panel
      ref={ref}
      {...rest}
    >
      <header>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </header>
      {policies.length === 0 ? (
        <p
          className="px-2 py-3 text-center text-xs text-muted-foreground"
          data-policy-state="empty"
        >
          {resolvedLabels.empty}
        </p>
      ) : (
        <ul className="space-y-0.5">
          {policies.map((policy) => (
            <li key={policy.id}>
              <Row policy={policy} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
PolicyDeliveryPanel.displayName = "PolicyDeliveryPanel";
