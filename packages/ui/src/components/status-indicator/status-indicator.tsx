import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const statusIndicatorVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border font-medium transition-colors",
  {
    compoundVariants: [
      {
        className: "border-border text-foreground",
        tone: "neutral",
        variant: "outline",
      },
      {
        className: "border-transparent bg-muted text-foreground",
        tone: "neutral",
        variant: "soft",
      },
      {
        className: "bg-foreground text-background",
        tone: "neutral",
        variant: "solid",
      },
      {
        className:
          "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300",
        tone: "success",
        variant: "outline",
      },
      {
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
        tone: "success",
        variant: "soft",
      },
      {
        className: "bg-emerald-600 text-white dark:bg-emerald-500",
        tone: "success",
        variant: "solid",
      },
      {
        className:
          "border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-300",
        tone: "warning",
        variant: "outline",
      },
      {
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
        tone: "warning",
        variant: "soft",
      },
      {
        className:
          "bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950",
        tone: "warning",
        variant: "solid",
      },
      {
        className:
          "border-red-200 text-red-700 dark:border-red-900 dark:text-red-300",
        tone: "danger",
        variant: "outline",
      },
      {
        className:
          "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
        tone: "danger",
        variant: "soft",
      },
      {
        className: "bg-red-600 text-white dark:bg-red-500",
        tone: "danger",
        variant: "solid",
      },
      {
        className:
          "border-sky-200 text-sky-700 dark:border-sky-900 dark:text-sky-300",
        tone: "info",
        variant: "outline",
      },
      {
        className:
          "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
        tone: "info",
        variant: "soft",
      },
      {
        className: "bg-sky-600 text-white dark:bg-sky-500",
        tone: "info",
        variant: "solid",
      },
    ],
    defaultVariants: {
      size: "md",
      tone: "neutral",
      variant: "soft",
    },
    variants: {
      size: {
        lg: "min-h-8 px-3 text-sm",
        md: "min-h-7 px-2.5 text-xs",
        sm: "min-h-6 px-2 text-[11px]",
      },
      tone: {
        danger: "",
        info: "",
        neutral: "",
        success: "",
        warning: "",
      },
      variant: {
        outline: "bg-background",
        soft: "border-transparent",
        solid: "border-transparent text-primary-foreground",
      },
    },
  },
);

const dotVariants = cva("rounded-full", {
  defaultVariants: {
    size: "md",
    tone: "neutral",
  },
  variants: {
    size: {
      lg: "h-2.5 w-2.5",
      md: "h-2 w-2",
      sm: "h-1.5 w-1.5",
    },
    tone: {
      danger: "bg-red-500",
      info: "bg-sky-500",
      neutral: "bg-muted-foreground",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
    },
  },
});

export type StatusIndicatorProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusIndicatorVariants> & {
    label?: string;
    pulse?: boolean;
    showDot?: boolean;
  };

const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  (
    {
      children,
      className,
      label,
      pulse = false,
      showDot = true,
      size,
      tone,
      variant,
      ...props
    },
    reference,
  ) => {
    const content = children ?? label;

    return (
      <span
        className={cn(
          statusIndicatorVariants({ size, tone, variant }),
          className,
        )}
        ref={reference}
        {...props}
      >
        {showDot ? (
          <span
            aria-hidden="true"
            className={cn(
              dotVariants({ size, tone }),
              pulse ? "animate-pulse" : undefined,
            )}
          />
        ) : null}
        {content}
      </span>
    );
  },
);

StatusIndicator.displayName = "StatusIndicator";

export { dotVariants, StatusIndicator, statusIndicatorVariants };
