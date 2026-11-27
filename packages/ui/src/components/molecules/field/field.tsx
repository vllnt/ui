"use client";

import * as React from "react";

import {
  Field as FieldPrimitive,
  FieldControl as FieldControlPrimitive,
  FieldDescription as FieldDescriptionPrimitive,
  FieldError as FieldErrorPrimitive,
  FieldLabel as FieldLabelPrimitive,
} from "@ui-sdk/react/field";

import { named } from "../../../lib/named";
import { Slot } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";
import { Label } from "../../atoms/label/label";

type FieldContextValue = {
  invalid: boolean;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** ui-sdk's parts also work outside a Field; ours keep requiring one. */
function useFieldContext(): FieldContextValue {
  const context = React.use(FieldContext);
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

// `invalid` is always passed on, so the browser's own validation never shows
// an error the caller did not ask for.
const Field = /* @__PURE__ */ named(
  "Field",
  ({
    children,
    className,
    invalid = false,
    orientation,
    ref,
  }: FieldProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const value = React.useMemo<FieldContextValue>(
      () => ({ invalid }),
      [invalid],
    );

    return (
      <FieldContext.Provider value={value}>
        <FieldPrimitive
          className={cn(fieldVariants({ orientation }), className)}
          invalid={invalid}
          ref={ref}
        >
          {children}
        </FieldPrimitive>
      </FieldContext.Provider>
    );
  },
);

/** Label wired to the field control through htmlFor. */
export type FieldLabelProps = React.ComponentPropsWithoutRef<typeof Label>;

const FieldLabel = /* @__PURE__ */ named(
  "FieldLabel",
  ({
    className,
    ref,
    ...props
  }: FieldLabelProps & {
    ref?: React.Ref<React.ComponentRef<typeof Label>>;
  }) => {
    const { invalid } = useFieldContext();

    return (
      <FieldLabelPrimitive
        render={
          <Label
            className={cn(invalid && "text-destructive", className)}
            ref={ref}
            {...props}
          />
        }
      />
    );
  },
);

/** Wraps the control and injects id plus aria wiring from the Field. */
export type FieldControlProps = {
  children: React.ReactNode;
};

const FieldControl = /* @__PURE__ */ named(
  "FieldControl",
  ({ children, ref }: FieldControlProps & { ref?: React.Ref<HTMLElement> }) => {
    useFieldContext();

    return <FieldControlPrimitive render={<Slot ref={ref}>{children}</Slot>} />;
  },
);

/** Helper text describing the field, announced to assistive tech. */
export type FieldDescriptionProps = React.ComponentPropsWithoutRef<"p">;

const FieldDescription = /* @__PURE__ */ named(
  "FieldDescription",
  ({
    className,
    ref,
    ...props
  }: FieldDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) => {
    useFieldContext();

    return (
      <FieldDescriptionPrimitive
        render={
          <p
            className={cn("text-sm text-muted-foreground", className)}
            ref={ref}
            {...props}
          />
        }
      />
    );
  },
);

/** Validation message that renders when children are present. */
export type FieldErrorProps = React.ComponentPropsWithoutRef<"p">;

const FieldError = /* @__PURE__ */ named(
  "FieldError",
  ({
    children,
    className,
    ref,
    ...props
  }: FieldErrorProps & { ref?: React.Ref<HTMLParagraphElement> }) => {
    useFieldContext();

    if (!children) {
      return null;
    }

    return (
      <FieldErrorPrimitive
        match
        render={
          <p
            className={cn("text-sm font-medium text-destructive", className)}
            ref={ref}
            role="alert"
            {...props}
          />
        }
      >
        {children}
      </FieldErrorPrimitive>
    );
  },
);

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldVariants,
};
