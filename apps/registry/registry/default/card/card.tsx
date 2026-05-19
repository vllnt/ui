import * as React from "react";

import { cn } from "@vllnt/ui";

const Card = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    ref={reference}
    {...props}
  />
);
Card.displayName = "Card";

const CardHeader = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    ref={reference}
    {...props}
  />
);
CardHeader.displayName = "CardHeader";

const CardTitle = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    ref={reference}
    {...props}
  />
);
CardTitle.displayName = "CardTitle";

const CardDescription = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("text-sm text-muted-foreground", className)}
    ref={reference}
    {...props}
  />
);
CardDescription.displayName = "CardDescription";

const CardContent = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} ref={reference} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    ref={reference}
    {...props}
  />
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
