"use client";

import * as React from "react";

import { cva } from "class-variance-authority";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Input } from "../../atoms/input/input";
import { Label } from "../../atoms/label/label";
import { Separator } from "../../atoms/separator/separator";
import { Spinner } from "../../atoms/spinner/spinner";

const DEFAULT_APPLY_LABEL = "Apply";
const DEFAULT_CHECKOUT_LABEL = "Checkout";
const DEFAULT_PROMO_TITLE = "Promo code";

const surfaceVariants = cva("flex w-full flex-col", {
  defaultVariants: { layout: "desktop" },
  variants: {
    layout: {
      desktop: "gap-4 p-6",
      phone: "gap-3 p-4",
    },
  },
});

/**
 * Density of {@link OrderSummary}. Maps to the Penpot `Layout` axis
 * (`desktop` | `phone`) and changes padding and spacing, nothing else.
 *
 * @public
 */
export type OrderSummaryLayout = "desktop" | "phone";

/**
 * One priced row. The host preformats both strings, so the component never
 * formats currency.
 *
 * @public
 */
export type OrderSummaryLine = {
  /** Row label, for example `"Shipping"`. */
  label: string;
  /** Preformatted value, for example `"$8.00"`. */
  value: string;
};

/**
 * Promo code state. Maps to the Penpot `Status` axis: `default` is `idle`,
 * `applying-promo` is `applying`, `error` is `error`.
 *
 * @public
 */
export type OrderSummaryPromoStatus = "applying" | "error" | "idle";

/**
 * Localizable strings for the promo code area of {@link OrderSummary}.
 *
 * @public
 */
export type OrderSummaryPromoLabels = {
  /** Apply button word, also shown next to the spinner. Defaults to `"Apply"`. */
  apply?: string;
  /** Input placeholder. No placeholder when omitted. */
  placeholder?: string;
  /** Visible label of the input. Defaults to `"Promo code"`. */
  title?: string;
};

/**
 * Controlled promo code form of {@link OrderSummary}.
 *
 * @public
 */
export type OrderSummaryPromo = {
  /**
   * Text under the input. With `status="error"` the hint carries the error
   * message and screen readers announce it as an alert; pass one whenever the
   * status is `error`.
   */
  hint?: string;
  /** Strings for the promo area. */
  labels?: OrderSummaryPromoLabels;
  /** Called on form submit. Skipped while `status="applying"`. */
  onApply: () => void;
  /** Called with the new input value on every change. */
  onValueChange: (value: string) => void;
  /** Defaults to `"idle"`. */
  status?: OrderSummaryPromoStatus;
  /** Current input value. */
  value: string;
};

/**
 * Props for {@link OrderSummary}.
 *
 * @public
 */
export type OrderSummaryProps = Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children" | "title"
> & {
  /** Checkout button label. Defaults to `"Checkout"`. */
  checkoutLabel?: string;
  /** Sets `aria-busy`, shows a spinner and disables the checkout button. */
  checkoutLoading?: boolean;
  /** Density of the summary. Defaults to `"desktop"`. */
  layout?: OrderSummaryLayout;
  /** Rows above the total (subtotal, shipping, tax, …), in display order. */
  lines: OrderSummaryLine[];
  /** Called on a click of the checkout button. */
  onCheckout?: () => void;
  /** Promo code form. Not rendered when omitted. */
  promo?: OrderSummaryPromo;
  /** Heading that also names the section. No heading when omitted. */
  title?: string;
  /** Last row of the summary. */
  total: OrderSummaryLine;
};

type SummaryRowProps = {
  emphasis?: boolean;
  line: OrderSummaryLine;
};

function SummaryRow({
  emphasis = false,
  line,
}: SummaryRowProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4",
        emphasis && "text-base font-semibold",
      )}
    >
      <dt className={cn(!emphasis && "text-muted-foreground")}>{line.label}</dt>
      <dd className="text-right tabular-nums">{line.value}</dd>
    </div>
  );
}

type SummaryRowsProps = {
  lines: OrderSummaryLine[];
  total: OrderSummaryLine;
};

function SummaryRows({ lines, total }: SummaryRowsProps): React.JSX.Element {
  return (
    <dl className="flex flex-col gap-2 text-sm">
      {lines.map((line, index) => (
        <SummaryRow key={`${String(index)}-${line.label}`} line={line} />
      ))}
      <SummaryRow emphasis line={total} />
    </dl>
  );
}

type PromoFormProps = {
  promo: OrderSummaryPromo;
};

function PromoForm({ promo }: PromoFormProps): React.JSX.Element {
  const baseId = React.useId();
  const inputId = `${baseId}-promo`;
  const hintId = `${baseId}-promo-hint`;
  const status = promo.status ?? "idle";
  const isApplying = status === "applying";
  const isError = status === "error";
  const hint = promo.hint ?? "";

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isApplying) {
      promo.onApply();
    }
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <Label htmlFor={inputId}>
        {promo.labels?.title ?? DEFAULT_PROMO_TITLE}
      </Label>
      <div className="flex gap-2">
        <Input
          aria-describedby={hint ? hintId : undefined}
          aria-invalid={isError ? true : undefined}
          className={cn(isError && "border-destructive")}
          id={inputId}
          onChange={(event) => {
            promo.onValueChange(event.currentTarget.value);
          }}
          placeholder={promo.labels?.placeholder}
          value={promo.value}
        />
        <Button disabled={isApplying} type="submit" variant="outline">
          {isApplying ? <Spinner size="sm" /> : null}
          {promo.labels?.apply ?? DEFAULT_APPLY_LABEL}
        </Button>
      </div>
      {hint ? (
        <p
          className={cn(
            "text-xs",
            isError ? "text-destructive" : "text-muted-foreground",
          )}
          id={hintId}
          role={isError ? "alert" : undefined}
        >
          {hint}
        </p>
      ) : null}
    </form>
  );
}

type CheckoutButtonProps = {
  label: string;
  loading: boolean;
  onCheckout?: () => void;
};

function CheckoutButton({
  label,
  loading,
  onCheckout,
}: CheckoutButtonProps): React.JSX.Element {
  return (
    <Button
      aria-busy={loading ? true : undefined}
      className="w-full"
      disabled={loading}
      onClick={() => {
        onCheckout?.();
      }}
      size="lg"
      type="button"
    >
      {loading ? <Spinner size="sm" /> : null}
      {label}
    </Button>
  );
}

/**
 * Order summary: priced rows, a total, an optional promo code form and a
 * checkout button. Pure presentation: the host formats every value, owns the
 * cart and the promo state, and reacts to `onApply` and `onCheckout`.
 *
 * @example
 * ```tsx
 * <OrderSummary
 *   title="Order summary"
 *   lines={[
 *     { label: "Subtotal", value: "$120.00" },
 *     { label: "Shipping", value: "$8.00" },
 *   ]}
 *   total={{ label: "Total", value: "$128.00" }}
 *   onCheckout={startCheckout}
 * />
 * ```
 *
 * @public
 */
export const OrderSummary = ({
  checkoutLabel = DEFAULT_CHECKOUT_LABEL,
  checkoutLoading = false,
  className,
  layout = "desktop",
  lines,
  onCheckout,
  promo,
  ref: reference,
  title,
  total,
  ...props
}: OrderSummaryProps & { ref?: React.Ref<HTMLElement> }): React.JSX.Element => {
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={className}
      data-layout={layout}
      ref={reference}
      {...props}
    >
      <Card className={surfaceVariants({ layout })}>
        {title ? (
          <h2
            className="text-lg font-semibold leading-none tracking-tight"
            id={titleId}
          >
            {title}
          </h2>
        ) : null}
        <SummaryRows lines={lines} total={total} />
        <Separator />
        {promo ? <PromoForm promo={promo} /> : null}
        <CheckoutButton
          label={checkoutLabel}
          loading={checkoutLoading}
          onCheckout={onCheckout}
        />
      </Card>
    </section>
  );
};

OrderSummary.displayName = "OrderSummary";
