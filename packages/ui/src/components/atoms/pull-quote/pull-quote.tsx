import { cva } from "class-variance-authority";

import { cn } from "../../../lib/utils";

const pullQuoteVariants = cva(
  "flex flex-col font-[family-name:var(--font-sans)] text-foreground",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "gap-6",
        md: "gap-4",
      },
    },
  },
);

const pullQuoteRuleVariants = cva("block rounded-full bg-primary", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "h-1 w-16",
      md: "h-0.5 w-12",
    },
  },
});

const pullQuoteBodyVariants = cva(
  "font-[family-name:var(--font-display)] tracking-tight text-balance",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "text-[length:var(--font-size-h2)] leading-[var(--line-height-h2)]",
        md: "text-[length:var(--font-size-h4)] leading-[var(--line-height-h4)]",
      },
    },
  },
);

const pullQuoteCiteVariants = cva("text-muted-foreground", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "text-[length:var(--font-size-body)] leading-[var(--line-height-body)]",
      md: "text-[length:var(--font-size-body-sm)] leading-[var(--line-height-body-sm)]",
    },
  },
});

/** Props for {@link PullQuote}. */
export type PullQuoteProps = Omit<
  React.ComponentPropsWithoutRef<"figure">,
  "children"
> & {
  /** The quoted text. */
  children: React.ReactNode;
  /** Attribution shown under the quote, rendered in a `<figcaption>`. */
  cite?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
  /** Type scale. `lg` is larger display type. Defaults to `md`. */
  size?: "lg" | "md";
};

/**
 * Highlighted quotation lifted out of long-form content: a short decorative
 * rule, the quote and an optional attribution.
 *
 * Renders a `<figure>` holding a `<blockquote>` and, when you pass `cite`, a
 * `<figcaption>`. The rule has `aria-hidden`. Pure presentation: it composes no
 * other component and reads no state.
 *
 * @example
 * <PullQuote cite="Ada Lovelace" size="lg">
 *   The engine weaves algebraic patterns.
 * </PullQuote>
 */
const PullQuote = ({
  children,
  cite,
  className,
  ref,
  size = "md",
  ...props
}: PullQuoteProps): React.ReactElement => (
  <figure
    className={cn(pullQuoteVariants({ size }), className)}
    ref={ref}
    {...props}
  >
    <span aria-hidden="true" className={pullQuoteRuleVariants({ size })} />
    <blockquote className={pullQuoteBodyVariants({ size })}>
      {children}
    </blockquote>
    {cite ? (
      <figcaption className={pullQuoteCiteVariants({ size })}>
        {cite}
      </figcaption>
    ) : null}
  </figure>
);
PullQuote.displayName = "PullQuote";

export { PullQuote };
