"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";
import { Input } from "@vllnt/ui";
import { Label } from "@vllnt/ui";

/** Labelled text input bundling description and error message together. */
export type TextFieldProps = React.ComponentPropsWithoutRef<"input"> & {
  description?: React.ReactNode;
  error?: React.ReactNode;
  label?: React.ReactNode;
  labelClassName?: string;
  rootClassName?: string;
};

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      description,
      error,
      id,
      label,
      labelClassName,
      rootClassName,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const invalid = Boolean(error);
    const describedBy =
      [description ? descriptionId : null, error ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", rootClassName)}>
        {label ? (
          <Label
            className={cn(invalid && "text-destructive", labelClassName)}
            htmlFor={inputId}
          >
            {label}
          </Label>
        ) : null}
        <Input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={className}
          id={inputId}
          ref={ref}
        />
        {description ? (
          <p className="text-sm text-muted-foreground" id={descriptionId}>
            {description}
          </p>
        ) : null}
        {error ? (
          <p
            className="text-sm font-medium text-destructive"
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export { TextField };
