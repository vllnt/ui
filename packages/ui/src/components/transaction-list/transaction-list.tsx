import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge/badge";

const CENTS_PER_UNIT = 100;
const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";

const CURRENCY_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();
function getCurrencyFormatter(
  locale: string,
  currency: string,
  signDisplay: Intl.NumberFormatOptions["signDisplay"] = "auto",
): Intl.NumberFormat {
  const key = `${locale}|${currency}|${signDisplay}`;
  let formatter = CURRENCY_FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = Intl.NumberFormat(locale, {
      currency,
      signDisplay,
      style: "currency",
    });
    CURRENCY_FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}

const DATE_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
function getTransactionDateFormatter(locale: string): Intl.DateTimeFormat {
  let formatter = DATE_FORMATTER_CACHE.get(locale);
  if (!formatter) {
    formatter = Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    DATE_FORMATTER_CACHE.set(locale, formatter);
  }
  return formatter;
}

/**
 * Transaction type for {@link TransactionListItem}.
 *
 * @public
 */
export type TransactionType = "credit" | "debit" | "initial" | "refund";

/**
 * Renewal interval for {@link TransactionListSubscriptionRow}.
 *
 * @public
 */
export type SubscriptionInterval = "day" | "month" | "week" | "year";

/**
 * Subscription status for {@link TransactionListSubscriptionRow}.
 *
 * @public
 */
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

/**
 * Localizable strings.
 *
 * @public
 */
export type TransactionListLabels = {
  /** Caption for the active subscription badge. Defaults to `"Active"`. */
  active?: string;
  /** Caption for the canceled subscription badge. Defaults to `"Canceled"`. */
  canceled?: string;
  /** Caption for the past-due subscription badge. Defaults to `"Past due"`. */
  pastDue?: string;
  /** Renewal label prefix. Defaults to `"Renews"`. */
  renews?: string;
  /** Caption for the trial subscription badge. Defaults to `"Trial"`. */
  trialing?: string;
};

const DEFAULT_LABELS = {
  active: "Active",
  canceled: "Canceled",
  pastDue: "Past due",
  renews: "Renews",
  trialing: "Trial",
} as const satisfies Required<TransactionListLabels>;

/**
 * One transaction entry.
 *
 * @public
 */
export type Transaction = {
  /** Amount in minor units (cents). Always positive — `type` decides the sign. */
  amountCents: number;
  /** Unix timestamp (ms) for the transaction. */
  createdAt: number;
  /** Free-form description. */
  description: ReactNode;
  /** Stable identifier. */
  id: string;
  /** Optional secondary line (e.g. `"VAT incl."`). */
  meta?: ReactNode;
  /** Transaction type. */
  type: TransactionType;
};

const SIGN_BY_TYPE: Record<TransactionType, "negative" | "positive"> = {
  credit: "positive",
  debit: "negative",
  initial: "positive",
  refund: "positive",
};

const AMOUNT_CLASS: Record<"negative" | "positive", string> = {
  negative: "text-destructive",
  positive: "text-emerald-600 dark:text-emerald-400",
};

const STATUS_VARIANT: Record<
  SubscriptionStatus,
  "default" | "destructive" | "outline" | "secondary"
> = {
  active: "default",
  canceled: "secondary",
  past_due: "destructive",
  trialing: "outline",
};

const STATUS_LABEL_KEY: Record<
  SubscriptionStatus,
  keyof Required<TransactionListLabels>
> = {
  active: "active",
  canceled: "canceled",
  past_due: "pastDue",
  trialing: "trialing",
};

const INTERVAL_LABEL: Record<SubscriptionInterval, string> = {
  day: "day",
  month: "mo",
  week: "wk",
  year: "yr",
};

/**
 * Format an amount in minor units as a localized currency string. Use the
 * locale + currency from {@link TransactionListProps} to drive the output.
 * Pass `signDisplay` to let `Intl` place the sign — required for correct
 * bidirectional output in RTL locales (e.g. `ar-SA`, `he-IL`), where a
 * manually prepended `+`/`-` corrupts the directional marks.
 *
 * @public
 */
export function formatTransactionAmount(
  amountCents: number,
  options: {
    currency?: string;
    locale?: string;
    signDisplay?: Intl.NumberFormatOptions["signDisplay"];
  } = {},
): string {
  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    signDisplay = "auto",
  } = options;
  return getCurrencyFormatter(locale, currency, signDisplay).format(
    amountCents / CENTS_PER_UNIT,
  );
}

/**
 * Format a Unix timestamp (ms) as a short locale-aware date.
 *
 * @public
 */
export function formatTransactionDate(
  timestamp: number,
  locale: string = DEFAULT_LOCALE,
): string {
  return getTransactionDateFormatter(locale).format(new Date(timestamp));
}

/**
 * Props for {@link TransactionList}.
 *
 * @public
 */
export type TransactionListProps = {
  /** Currency code (ISO 4217). Defaults to `"USD"`. */
  currency?: string;
  /** Caption shown when the list is empty and no pinned children exist. */
  emptyMessage?: ReactNode;
  /** Localizable strings. */
  labels?: TransactionListLabels;
  /** BCP-47 locale tag. Defaults to `"en-US"`. */
  locale?: string;
  /** Transaction array (rendered after pinned children). */
  transactions: Transaction[];
} & ComponentPropsWithoutRef<"div">;

type TransactionListComponent = typeof TransactionListBase & {
  Pinned: typeof TransactionListPinned;
  SubscriptionRow: typeof TransactionListSubscriptionRow;
};

const TransactionListBase = ({
  ref,
  ...props
}: TransactionListProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const {
    children,
    className,
    currency,
    emptyMessage,
    labels,
    locale,
    transactions,
    ...rest
  } = props;
  const isEmpty = transactions.length === 0;
  const hasPinned = Boolean(children);
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border bg-background p-3",
        className,
      )}
      ref={ref}
      {...rest}
    >
      {children}
      {isEmpty && !hasPinned && emptyMessage ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}
      {isEmpty ? null : (
        <ul className="flex flex-col gap-1.5">
          {transactions.map((transaction) => (
            <TransactionListItem
              currency={currency}
              key={transaction.id}
              labels={labels}
              locale={locale}
              transaction={transaction}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
TransactionListBase.displayName = "TransactionList";

/**
 * Props for {@link TransactionListPinned}.
 *
 * @public
 */
export type TransactionListPinnedProps = ComponentPropsWithoutRef<"div">;

/**
 * Wrapper that renders pinned content (typically the active subscription
 * row) above the main transaction list.
 *
 * @public
 */
export const TransactionListPinned = ({
  children,
  className,
  ref,
  ...rest
}: TransactionListPinnedProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <div className={cn("flex flex-col gap-1.5", className)} ref={ref} {...rest}>
    {children}
  </div>
);
TransactionListPinned.displayName = "TransactionList.Pinned";

type TransactionListItemProps = {
  currency?: string;
  labels?: TransactionListLabels;
  locale?: string;
  transaction: Transaction;
};

function TransactionListItem({
  currency,
  locale,
  transaction,
}: TransactionListItemProps): ReactNode {
  const sign = SIGN_BY_TYPE[transaction.type];
  const signedCents =
    sign === "negative" ? -transaction.amountCents : transaction.amountCents;
  const display = formatTransactionAmount(signedCents, {
    currency,
    locale,
    signDisplay: "always",
  });
  const ariaLabel =
    typeof transaction.description === "string"
      ? `${sign === "negative" ? "Debit" : "Credit"} ${display} for ${transaction.description}`
      : undefined;
  return (
    <li
      className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2"
      data-transaction-type={transaction.type}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">
          {transaction.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatTransactionDate(transaction.createdAt, locale)}
          {transaction.meta ? <span> · {transaction.meta}</span> : null}
        </p>
      </div>
      <span
        aria-label={ariaLabel}
        className={cn(
          "shrink-0 font-mono text-sm font-semibold",
          AMOUNT_CLASS[sign],
        )}
      >
        {display}
      </span>
    </li>
  );
}

/**
 * Props for {@link TransactionListSubscriptionRow}.
 *
 * @public
 */
export type TransactionListSubscriptionRowProps = {
  /** Subscription amount per interval, in minor units. */
  amountCents: number;
  /** Currency code (ISO 4217). Defaults to `"USD"`. */
  currency?: string;
  /** Renewal interval. */
  interval: SubscriptionInterval;
  /** Localizable strings. */
  labels?: TransactionListLabels;
  /** BCP-47 locale tag. Defaults to `"en-US"`. */
  locale?: string;
  /** Optional secondary metadata (e.g. `"VAT incl."`). */
  meta?: ReactNode;
  /** Plan display name. */
  plan: ReactNode;
  /** Optional renewal timestamp (ms). */
  renewsAt?: number;
  /** Subscription status. */
  status: SubscriptionStatus;
} & ComponentPropsWithoutRef<"div">;

type SubscriptionMetaProps = {
  locale?: string;
  meta?: ReactNode;
  renewsAt?: number;
  renewsLabel: string;
};

function SubscriptionMeta({
  locale,
  meta,
  renewsAt,
  renewsLabel,
}: SubscriptionMetaProps): ReactNode {
  if (renewsAt === undefined && !meta) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {renewsAt === undefined
        ? null
        : `${renewsLabel} ${formatTransactionDate(renewsAt, locale)}`}
      {renewsAt !== undefined && meta ? <span> · {meta}</span> : null}
      {renewsAt === undefined && meta ? meta : null}
    </p>
  );
}

/**
 * Active-subscription row for the pinned section. Renders a green-border
 * card with plan name, status badge, amount/interval, and optional
 * renewal date.
 *
 * @public
 */
export const TransactionListSubscriptionRow = ({
  ref,
  ...props
}: TransactionListSubscriptionRowProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const {
    amountCents,
    className,
    currency,
    interval,
    labels,
    locale,
    meta,
    plan,
    renewsAt,
    status,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const formatted = formatTransactionAmount(amountCents, { currency, locale });
  const intervalSuffix = INTERVAL_LABEL[interval];
  const isActive = status === "active";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border px-3 py-2",
        isActive
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-muted/20",
        className,
      )}
      data-status={status}
      ref={ref}
      {...rest}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{plan}</p>
          <Badge variant={STATUS_VARIANT[status]}>
            {resolvedLabels[STATUS_LABEL_KEY[status]]}
          </Badge>
        </div>
        <SubscriptionMeta
          locale={locale}
          meta={meta}
          renewsAt={renewsAt}
          renewsLabel={resolvedLabels.renews}
        />
      </div>
      <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
        {formatted}/{intervalSuffix}
      </span>
    </div>
  );
};
TransactionListSubscriptionRow.displayName = "TransactionList.SubscriptionRow";

/**
 * Chronological list of financial transactions with credit/debit color
 * coding, locale-aware currency / date formatting, and an optional pinned
 * section for the active subscription.
 *
 * @example
 * ```tsx
 * <TransactionList
 *   transactions={transactions}
 *   currency="EUR"
 *   locale="en-IE"
 *   emptyMessage="No transactions yet"
 * >
 *   <TransactionList.Pinned>
 *     <TransactionList.SubscriptionRow
 *       plan="AI OS Pro"
 *       status="active"
 *       amountCents={1200}
 *       renewsAt={1713139200000}
 *       interval="month"
 *     />
 *   </TransactionList.Pinned>
 * </TransactionList>
 * ```
 *
 * @public
 */
export const TransactionList = TransactionListBase as TransactionListComponent;
TransactionList.Pinned = TransactionListPinned;
TransactionList.SubscriptionRow = TransactionListSubscriptionRow;
