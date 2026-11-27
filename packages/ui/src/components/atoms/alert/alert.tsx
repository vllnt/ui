import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-foreground dark:border-destructive [&>svg]:text-destructive",
      },
    },
  },
);

/**
 * Callout box with `role="alert"`. The `destructive` variant keeps the title
 * and body in the foreground colour: status colour sits on the border and on a
 * direct child `svg` glyph, never on words.
 *
 * @example
 * ```tsx
 * <Alert variant="destructive">
 *   <AlertCircle aria-hidden="true" className="size-4" />
 *   <AlertTitle>Payment failed</AlertTitle>
 *   <AlertDescription>Check the card number.</AlertDescription>
 * </Alert>
 * ```
 */
const Alert = /* @__PURE__ */ named(
  "Alert",
  ({
    className,
    ref,
    variant,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & {
      ref?: React.Ref<HTMLDivElement>;
    }) => (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      ref={ref}
      role="alert"
      {...props}
    />
  ),
);

const AlertTitle = /* @__PURE__ */ named(
  "AlertTitle",
  ({
    children,
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement> & {
    ref?: React.Ref<HTMLParagraphElement>;
  }) => (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      data-slot="alert-title"
      ref={ref}
      {...props}
    >
      {children}
    </h5>
  ),
);

const AlertDescription = /* @__PURE__ */ named(
  "AlertDescription",
  ({
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement> & {
    ref?: React.Ref<HTMLParagraphElement>;
  }) => (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      data-slot="alert-description"
      ref={ref}
      {...props}
    />
  ),
);

export { Alert, AlertDescription, AlertTitle, alertVariants };
