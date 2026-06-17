"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@vllnt/ui";
import { Label } from "@vllnt/ui";

type FieldContextValue = {
  descriptionId: string;
  errorId: string;
  id: string;
  invalid: boolean;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext(): FieldContextValue {
  const context = React.useContext(FieldContext);
  if (!context) {
    throw new Error("Field subcomponents must be used within a Field");
  }
  return context;
}

const fieldVariants = cva("flex", {
  defaultVariants: {
    orientation: "vertical",
  },
  variants: {
    orientation: {
      horizontal: "flex-row items-center gap-3",
      vertical: "flex-col gap-1.5",
    },
  },
});

/** Groups a label, control, description, and error message for one input. */
export type FieldProps = {
  children: React.ReactNode;
  className?: string;
  invalid?: boolean;
} & VariantProps<typeof fieldVariants>;

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ children, className, invalid = false, orientation }, ref) => {
    const id = React.useId();
    const value = React.useMemo<FieldContextValue>(
      () => ({
        descriptionId: `${id}-description`,
        errorId: `${id}-error`,
        id: `${id}-control`,
        invalid,
      }),
      [id, invalid],
    );

    return (
      <FieldContext.Provider value={value}>
        <div
          className={cn(fieldVariants({ orientation }), className)}
          data-slot="field"
          ref={ref}
        >
          {children}
        </div>
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";

/** Label wired to the field control through htmlFor. */
export type FieldLabelProps = React.ComponentPropsWithoutRef<typeof Label>;

const FieldLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  FieldLabelProps
>(({ className, ...props }, ref) => {
  const { id, invalid } = useFieldContext();

  return (
    <Label
      className={cn(invalid && "text-destructive", className)}
      htmlFor={id}
      ref={ref}
      {...props}
    />
  );
});
FieldLabel.displayName = "FieldLabel";

/** Wraps the control and injects id plus aria wiring from the Field. */
export type FieldControlProps = {
  children: React.ReactNode;
};

const FieldControl = React.forwardRef<HTMLElement, FieldControlProps>(
  ({ children }, ref) => {
    const { descriptionId, errorId, id, invalid } = useFieldContext();
    const describedBy =
      [descriptionId, invalid ? errorId : null].filter(Boolean).join(" ") ||
      undefined;

    return (
      <Slot
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        id={id}
        ref={ref}
      >
        {children}
      </Slot>
    );
  },
);
FieldControl.displayName = "FieldControl";

/** Helper text describing the field, announced to assistive tech. */
export type FieldDescriptionProps = React.ComponentPropsWithoutRef<"p">;

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(({ className, ...props }, ref) => {
  const { descriptionId } = useFieldContext();

  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      id={descriptionId}
      ref={ref}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

/** Validation message that renders when children are present. */
export type FieldErrorProps = React.ComponentPropsWithoutRef<"p">;

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ children, className, ...props }, ref) => {
    const { errorId } = useFieldContext();

    if (!children) {
      return null;
    }

    return (
      <p
        className={cn("text-sm font-medium text-destructive", className)}
        id={errorId}
        ref={ref}
        role="alert"
        {...props}
      >
        {children}
      </p>
    );
  },
);
FieldError.displayName = "FieldError";

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldVariants,
};
