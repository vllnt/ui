"use client";

import {
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useCallback,
  useState,
} from "react";

import { Check, X } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Button, type ButtonProps } from "@vllnt/ui";

/**
 * One row in a {@link PricingPlan}'s feature checklist.
 *
 * @public
 */
export type PricingFeature = {
  /**
   * When `true`, the row renders a check; when `false`, an X. Pass a string
   * (e.g. `"5 users"`) to render the value as the limit indicator instead.
   */
  included: boolean | string;
  /** Human-readable feature description. */
  label: ReactNode;
};

/**
 * Call-to-action descriptor for a {@link PricingPlan}.
 *
 * @public
 */
export type PricingPlanCta = {
  /** Button label. */
  label: ReactNode;
  /** Click handler. */
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  /** Underlying {@link Button} variant. Defaults to `"default"`. */
  variant?: ButtonProps["variant"];
};

/**
 * Props for {@link PricingPlan}.
 *
 * @public
 */
export type PricingPlanProps = {
  /** Optional badge text shown on highlighted plans (e.g. "Most Popular"). */
  badge?: ReactNode;
  /** Bottom-row call-to-action descriptor. */
  cta?: PricingPlanCta;
  /** Sub-headline shown under the plan name. */
  description?: ReactNode;
  /** Feature checklist. */
  features?: PricingFeature[];
  /** When `true`, the plan renders with emphasis styling. */
  highlighted?: boolean;
  /** Plan name (e.g. "Free", "Pro"). */
  name: ReactNode;
  /** Suffix shown next to the price (e.g. "/month"). */
  period?: ReactNode;
  /** Headline price. */
  price: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

function FeatureIndicator({
  included,
}: {
  included: boolean | string;
}): ReactNode {
  if (typeof included === "string") {
    return (
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary"
      >
        ✓
      </span>
    );
  }
  if (included) {
    return (
      <Check
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-primary"
      />
    );
  }
  return (
    <X
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-muted-foreground/60"
    />
  );
}

function FeatureRow({ feature }: { feature: PricingFeature }): ReactNode {
  const { included, label } = feature;
  const isLimit = typeof included === "string";
  return (
    <li className="flex items-start gap-2 text-sm">
      <FeatureIndicator included={included} />
      <span
        className={cn(
          "flex-1",
          included === false && "text-muted-foreground line-through",
        )}
      >
        {label}
        {isLimit ? (
          <span className="ml-1 text-muted-foreground">({included})</span>
        ) : null}
      </span>
    </li>
  );
}

function PlanBadgePill({
  badge,
  highlighted,
}: {
  badge: ReactNode;
  highlighted: boolean;
}): ReactNode {
  return (
    <span
      className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        highlighted
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {badge}
    </span>
  );
}

function PlanHeader({
  description,
  name,
}: {
  description: ReactNode;
  name: ReactNode;
}): ReactNode {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {name}
      </h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function PlanPrice({
  period,
  price,
}: {
  period: ReactNode;
  price: ReactNode;
}): ReactNode {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold tracking-tight text-foreground">
        {price}
      </span>
      {period ? (
        <span className="text-sm text-muted-foreground">{period}</span>
      ) : null}
    </div>
  );
}

function PlanFeatures({ features }: { features: PricingFeature[] }): ReactNode {
  return (
    <ul className="flex flex-col gap-2">
      {features.map((feature, index) => (
        <FeatureRow
          feature={feature}
          key={`${typeof feature.label === "string" ? feature.label : index.toString()}-${index.toString()}`}
        />
      ))}
    </ul>
  );
}

type PlanCtaProps = {
  cta: PricingPlanCta;
  highlighted: boolean;
};

function PlanCta({ cta, highlighted }: PlanCtaProps): ReactNode {
  const { label, onClick: handleCtaClick, variant } = cta;
  return (
    <Button
      className="mt-auto w-full"
      onClick={handleCtaClick}
      type="button"
      variant={variant ?? (highlighted ? "default" : "outline")}
    >
      {label}
    </Button>
  );
}

/**
 * Single plan column inside a {@link PricingTable}.
 *
 * @example
 * ```tsx
 * <PricingPlan
 *   name="Pro"
 *   price="$29"
 *   period="/month"
 *   highlighted
 *   badge="Most Popular"
 *   features={[
 *     { label: "Unlimited projects", included: true },
 *     { label: "Storage", included: "100 GB" },
 *   ]}
 *   cta={{ label: "Start trial", onClick: startTrial }}
 * />
 * ```
 *
 * @public
 */
export const PricingPlan = (
  props: PricingPlanProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    badge,
    className,
    cta,
    description,
    features,
    highlighted = false,
    name,
    period,
    price,
    ref,
    ...rest
  } = props;
  return (
    <div
      className={cn(
        "relative flex flex-col gap-6 rounded-2xl border bg-background p-6 shadow-sm transition-colors",
        highlighted
          ? "border-primary shadow-md ring-1 ring-primary/20"
          : "border-border",
        className,
      )}
      ref={ref}
      {...rest}
    >
      {badge ? <PlanBadgePill badge={badge} highlighted={highlighted} /> : null}
      <PlanHeader description={description} name={name} />
      <PlanPrice period={period} price={price} />
      {features && features.length > 0 ? (
        <PlanFeatures features={features} />
      ) : null}
      {cta ? <PlanCta cta={cta} highlighted={highlighted} /> : null}
    </div>
  );
};
PricingPlan.displayName = "PricingPlan";

/**
 * Billing period for {@link PricingTable}'s built-in toggle.
 *
 * @public
 */
export type PricingPeriod = "annual" | "monthly";

type PeriodLabels = {
  annual?: ReactNode;
  monthly?: ReactNode;
  /** Optional caption shown next to the annual option (e.g. "Save 20%"). */
  savings?: ReactNode;
};

/**
 * Props for {@link PricingTable}.
 *
 * @public
 */
export type PricingTableProps = {
  /** Period selected when uncontrolled. Defaults to `"monthly"`. */
  defaultPeriod?: PricingPeriod;
  /** Fires when the user changes the period (controlled or uncontrolled). */
  onPeriodChange?: (period: PricingPeriod) => void;
  /** Controlled value for the period toggle. */
  period?: PricingPeriod;
  /** Captions for the toggle. Defaults to `Monthly` / `Annual`. */
  periodLabels?: PeriodLabels;
  /** Set to `true` to render the built-in monthly/annual toggle. */
  showPeriodToggle?: boolean;
} & ComponentPropsWithoutRef<"div">;

type PeriodToggleProps = {
  labels: PeriodLabels;
  onChange: (period: PricingPeriod) => void;
  period: PricingPeriod;
};

function PeriodToggle({
  labels,
  onChange,
  period,
}: PeriodToggleProps): ReactNode {
  const handleSelectMonthly = useCallback(() => {
    onChange("monthly");
  }, [onChange]);
  const handleSelectAnnual = useCallback(() => {
    onChange("annual");
  }, [onChange]);

  return (
    <div
      aria-label="Billing period"
      className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted/40 p-1 text-sm"
      role="radiogroup"
    >
      <button
        aria-checked={period === "monthly"}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          period === "monthly"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={handleSelectMonthly}
        role="radio"
        type="button"
      >
        {labels.monthly ?? "Monthly"}
      </button>
      <button
        aria-checked={period === "annual"}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 transition-colors",
          period === "annual"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={handleSelectAnnual}
        role="radio"
        type="button"
      >
        {labels.annual ?? "Annual"}
        {labels.savings ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {labels.savings}
          </span>
        ) : null}
      </button>
    </div>
  );
}

/**
 * Plan comparison container. Lays out child {@link PricingPlan} columns
 * side-by-side on desktop and stacks them on mobile. Optionally renders a
 * monthly/annual period toggle whose value flows through `onPeriodChange`.
 *
 * @example
 * ```tsx
 * const [period, setPeriod] = useState<PricingPeriod>("monthly")
 *
 * <PricingTable showPeriodToggle period={period} onPeriodChange={setPeriod}>
 *   <PricingPlan name="Free" price="$0" period="/mo" cta={{ label: "Start" }} />
 *   <PricingPlan name="Pro" price={period === "monthly" ? "$29" : "$24"} highlighted />
 * </PricingTable>
 * ```
 *
 * @public
 */
export const PricingTable = (
  props: PricingTableProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    children,
    className,
    defaultPeriod = "monthly",
    onPeriodChange,
    period: controlledPeriod,
    periodLabels,
    ref,
    showPeriodToggle = false,
    ...rest
  } = props;

  const [uncontrolledPeriod, setUncontrolledPeriod] =
    useState<PricingPeriod>(defaultPeriod);
  const period = controlledPeriod ?? uncontrolledPeriod;

  const handlePeriodChange = useCallback(
    (next: PricingPeriod) => {
      if (controlledPeriod === undefined) setUncontrolledPeriod(next);
      onPeriodChange?.(next);
    },
    [controlledPeriod, onPeriodChange],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} ref={ref} {...rest}>
      {showPeriodToggle ? (
        <PeriodToggle
          labels={periodLabels ?? {}}
          onChange={handlePeriodChange}
          period={period}
        />
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
};
PricingTable.displayName = "PricingTable";
