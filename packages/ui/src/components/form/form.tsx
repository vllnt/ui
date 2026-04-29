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

  return baseId.endsWith(`-${suffix}`)
    ? `${baseId}-${generatedId}`
    : `${baseId}-${suffix}-${generatedId}`;
}

function isNamedFormChild(
  child: React.ReactNode,
  name: "FormDescription" | "FormMessage",
): child is React.ReactElement<{ children?: React.ReactNode }> {
  if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
    return false;
  }

  const { type } = child;
  if (typeof type === "string" || typeof type === "symbol") {
    return false;
  }

  return "displayName" in type && type.displayName === name;
}

function hasVisibleContent(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (child === null || child === undefined || typeof child === "boolean") {
      return false;
    }

    if (typeof child === "string") {
      return child.length > 0;
    }

    if (typeof child === "number") {
      return true;
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      const nestedChildren = child.props.children;

      return nestedChildren === undefined
        ? true
        : hasVisibleContent(nestedChildren);
    }

    return true;
  });
}

function hasRenderedFormChild(
  children: React.ReactNode,
  name: "FormDescription" | "FormMessage",
): boolean {
  return React.Children.toArray(children).some((child) => {
    if (isNamedFormChild(child, name)) {
      return name === "FormMessage"
        ? hasVisibleContent(child.props.children)
        : true;
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return hasRenderedFormChild(child.props.children, name);
    }

    return false;
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
  React.ComponentPropsWithoutRef<"div"> & {
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
  }
>(
  (
    {
      children,
      className,
      disabled: itemDisabled,
      invalid: itemInvalid,
      required: itemRequired,
      ...props
    },
    ref,
  ) => {
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

    const effectiveDisabled = itemDisabled ?? disabled;
    const effectiveInvalid = itemInvalid ?? invalid;
    const effectiveRequired = itemRequired ?? required;

    const value = React.useMemo<FormItemContextValue>(
      () => ({
        controlId: resolveItemId(controlIdBase, generatedId, "control"),
        descriptionId: resolveItemId(
          descriptionIdBase,
          generatedId,
          "description",
        ),
        disabled: effectiveDisabled,
        hasDescription,
        hasMessage,
        invalid: effectiveInvalid,
        messageId: resolveItemId(messageIdBase, generatedId, "message"),
        required: effectiveRequired,
      }),
      [
        controlIdBase,
        descriptionIdBase,
        effectiveDisabled,
        effectiveInvalid,
        effectiveRequired,
        generatedId,
        hasDescription,
        hasMessage,
        messageIdBase,
      ],
    );

    return (
      <FormItemContext.Provider value={value}>
        <div className={cn("space-y-2", className)} ref={ref} {...props}>
          {children}
        </div>
      </FormItemContext.Provider>
    );
  },
);
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
  React.ComponentPropsWithoutRef<typeof Slot> & {
    disabled?: boolean;
    required?: boolean;
  }
>(
  (
    { disabled: controlDisabled, id: _id, required: controlRequired, ...props },
    ref,
  ) => {
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
    const effectiveDisabled = controlDisabled ?? disabled;
    const effectiveRequired = controlRequired ?? required;
    const nativeConstraintProps: {
      disabled?: boolean;
      required?: boolean;
    } = {
      disabled: effectiveDisabled || undefined,
      required: effectiveRequired || undefined,
    };

    return (
      <Slot
        {...props}
        {...nativeConstraintProps}
        aria-describedby={describedBy}
        aria-disabled={
          props["aria-disabled"] ?? (effectiveDisabled || undefined)
        }
        aria-invalid={props["aria-invalid"] ?? (invalid || undefined)}
        aria-required={
          props["aria-required"] ?? (effectiveRequired || undefined)
        }
        data-disabled={effectiveDisabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        id={controlId}
        ref={ref}
      />
    );
  },
);
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
  const hasChildren = hasVisibleContent(children);

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
