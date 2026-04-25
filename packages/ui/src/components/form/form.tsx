"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "../../lib/utils";
import { Label } from "../label";

type FormRootContextValue = {
  controlId?: string;
  descriptionId?: string;
  disabled: boolean;
  invalid: boolean;
  messageId?: string;
  required: boolean;
};

type FormItemContextValue = {
  controlId: string;
  descriptionId: string;
  disabled: boolean;
  hasDescription: boolean;
  hasMessage: boolean;
  invalid: boolean;
  messageId: string;
  required: boolean;
};

const FormRootContext = React.createContext<FormRootContextValue | undefined>(
  undefined,
);

const FormItemContext = React.createContext<FormItemContextValue | undefined>(
  undefined,
);

function useFormRootContext(componentName: string) {
  const context = React.useContext(FormRootContext);

  if (context === undefined) {
    throw new Error(`${componentName} must be used within Form.`);
  }

  return context;
}

function useFormItemContext(componentName: string) {
  const context = React.useContext(FormItemContext);

  if (context === undefined) {
    throw new Error(`${componentName} must be used within FormItem.`);
  }

  return context;
}

function composeIds(...ids: (string | undefined)[]) {
  const value = ids.filter((id) => id !== undefined && id.length > 0).join(" ");

  return value.length > 0 ? value : undefined;
}

function resolveItemId(
  baseId: string | undefined,
  generatedId: string,
  suffix: string,
) {
  if (baseId === undefined) {
    return `${generatedId}-${suffix}`;
  }

  return `${baseId}-${generatedId}`;
}

function isNamedFormChild(
  child: React.ReactNode,
  name: "FormDescription" | "FormMessage",
): child is React.ReactElement<{ children?: React.ReactNode }> {
  if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
    return false;
  }

  const { type } = child;
  if (typeof type === "string") {
    return false;
  }

  return "displayName" in type && type.displayName === name;
}

function hasRenderedFormChild(
  children: React.ReactNode,
  name: "FormDescription" | "FormMessage",
) {
  return React.Children.toArray(children).some((child) => {
    if (!isNamedFormChild(child, name)) {
      return false;
    }

    if (name === "FormMessage") {
      return React.Children.count(child.props.children) > 0;
    }

    return true;
  });
}

export type FormProps = React.ComponentPropsWithoutRef<"form"> & {
  controlId?: string;
  descriptionId?: string;
  disabled?: boolean;
  invalid?: boolean;
  messageId?: string;
  required?: boolean;
};

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      className,
      controlId,
      descriptionId,
      disabled = false,
      invalid = false,
      messageId,
      required = false,
      ...props
    },
    ref,
  ) => {
    const value = React.useMemo<FormRootContextValue>(
      () => ({
        controlId,
        descriptionId,
        disabled,
        invalid,
        messageId,
        required,
      }),
      [controlId, descriptionId, disabled, invalid, messageId, required],
    );

    return (
      <FormRootContext.Provider value={value}>
        <form
          className={cn("space-y-2", className)}
          data-disabled={disabled ? "true" : undefined}
          data-invalid={invalid ? "true" : undefined}
          ref={ref}
          {...props}
        />
      </FormRootContext.Provider>
    );
  },
);
Form.displayName = "Form";

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  const {
    controlId: controlIdBase,
    descriptionId: descriptionIdBase,
    disabled,
    invalid,
    messageId: messageIdBase,
    required,
  } = useFormRootContext("FormItem");
  const generatedId = React.useId();
  const hasDescription = hasRenderedFormChild(children, "FormDescription");
  const hasMessage = hasRenderedFormChild(children, "FormMessage");

  const value = React.useMemo<FormItemContextValue>(
    () => ({
      controlId: resolveItemId(controlIdBase, generatedId, "control"),
      descriptionId: resolveItemId(
        descriptionIdBase,
        generatedId,
        "description",
      ),
      disabled,
      hasDescription,
      hasMessage,
      invalid,
      messageId: resolveItemId(messageIdBase, generatedId, "message"),
      required,
    }),
    [
      controlIdBase,
      descriptionIdBase,
      disabled,
      generatedId,
      hasDescription,
      hasMessage,
      invalid,
      messageIdBase,
      required,
    ],
  );

  return (
    <FormItemContext.Provider value={value}>
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {children}
      </div>
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, htmlFor, ...props }, ref) => {
  const { controlId, invalid } = useFormItemContext("FormLabel");

  return (
    <Label
      className={cn(invalid && "text-destructive", className)}
      data-invalid={invalid ? "true" : undefined}
      htmlFor={htmlFor ?? controlId}
      ref={ref}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ id: _id, ...props }, ref) => {
  const {
    controlId,
    descriptionId,
    disabled,
    hasDescription,
    hasMessage,
    invalid,
    messageId,
    required,
  } = useFormItemContext("FormControl");

  const describedBy = composeIds(
    props["aria-describedby"],
    hasDescription ? descriptionId : undefined,
    invalid && hasMessage ? messageId : undefined,
  );
  const nativeConstraintProps: Record<string, boolean | undefined> = {
    disabled: disabled || undefined,
    required: required || undefined,
  };

  return (
    <Slot
      {...props}
      {...nativeConstraintProps}
      aria-describedby={describedBy}
      aria-disabled={props["aria-disabled"] ?? (disabled || undefined)}
      aria-invalid={props["aria-invalid"] ?? (invalid || undefined)}
      aria-required={props["aria-required"] ?? (required || undefined)}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      id={controlId}
      ref={ref}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, id: _id, ...props }, ref) => {
  const { descriptionId } = useFormItemContext("FormDescription");

  return (
    <p
      {...props}
      className={cn("text-sm text-muted-foreground", className)}
      id={descriptionId}
      ref={ref}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ children, className, id: _id, ...props }, ref) => {
  const { invalid, messageId } = useFormItemContext("FormMessage");
  const hasChildren = React.Children.count(children) > 0;

  if (!hasChildren) {
    return null;
  }

  return (
    <p
      {...props}
      className={cn(
        "text-sm font-medium",
        invalid ? "text-destructive" : "text-foreground",
        className,
      )}
      id={messageId}
      ref={ref}
      role={invalid ? "alert" : undefined}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage };
