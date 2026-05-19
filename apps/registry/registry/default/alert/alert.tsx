import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@vllnt/ui";

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
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
  },
);

const Alert = ({
  className,
  ref,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> &
  React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(alertVariants({ variant }), className)}
    ref={ref}
    role="alert"
    {...props}
  />
);

Alert.displayName = "Alert";

const AlertTitle = ({
  children,
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> &
  React.RefAttributes<HTMLParagraphElement>) => (
  <h5
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    ref={ref}
    {...props}
  >
    {children}
  </h5>
);

AlertTitle.displayName = "AlertTitle";

const AlertDescription = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> &
  React.RefAttributes<HTMLParagraphElement>) => (
  <div
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    ref={ref}
    {...props}
  />
);

AlertDescription.displayName = "AlertDescription";
export { Alert, AlertDescription, AlertTitle, alertVariants };
