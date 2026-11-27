import * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";

const Card = /* @__PURE__ */ named(
  "Card",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      data-slot="card"
      ref={reference}
      {...props}
    />
  ),
);

const CardHeader = /* @__PURE__ */ named(
  "CardHeader",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      data-slot="card-header"
      ref={reference}
      {...props}
    />
  ),
);

const CardTitle = /* @__PURE__ */ named(
  "CardTitle",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className,
      )}
      data-slot="card-title"
      ref={reference}
      {...props}
    />
  ),
);

const CardDescription = /* @__PURE__ */ named(
  "CardDescription",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="card-description"
      ref={reference}
      {...props}
    />
  ),
);

const CardContent = /* @__PURE__ */ named(
  "CardContent",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div
      className={cn("p-6 pt-0", className)}
      data-slot="card-content"
      ref={reference}
      {...props}
    />
  ),
);

const CardFooter = /* @__PURE__ */ named(
  "CardFooter",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      data-slot="card-footer"
      ref={reference}
      {...props}
    />
  ),
);

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
