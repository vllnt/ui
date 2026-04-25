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
  registerDescription: (present: boolean) => void;
  registerMessage: (present: boolean) => void;
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
>(({ className, ...props }, ref) => {
  const {
    controlId: controlIdBase,
    descriptionId: descriptionIdBase,
    disabled,
    invalid,
    messageId: messageIdBase,
    required,
  } = useFormRootContext("FormItem");
  const generatedId = React.useId();
  const [hasDescription, setHasDescription] = React.useState(false);
  const [hasMessage, setHasMessage] = React.useState(false);
  const registerDescription = React.useCallback((present: boolean) => {
    setHasDescription(present);
  }, []);
  const registerMessage = React.useCallback((present: boolean) => {
    setHasMessage(present);
  }, []);

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
      registerDescription,
      registerMessage,
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
      registerDescription,
      registerMessage,
      required,
    ],
  );

  return (
    <FormItemContext.Provider value={value}>
      <div className={cn("space-y-2", className)} ref={ref} {...props} />
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
>(({ ...props }, ref) => {
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
      id={props.id ?? controlId}
      ref={ref}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  const { descriptionId, registerDescription } =
    useFormItemContext("FormDescription");

  React.useEffect(() => {
    registerDescription(true);
    return () => {
      registerDescription(false);
    };
  }, [registerDescription]);

  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      id={descriptionId}
      ref={ref}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ children, className, ...props }, ref) => {
  const { invalid, messageId, registerMessage } =
    useFormItemContext("FormMessage");
  const hasChildren = React.Children.count(children) > 0;

  React.useEffect(() => {
    if (!hasChildren) {
      return;
    }
    registerMessage(true);
    return () => {
      registerMessage(false);
    };
  }, [hasChildren, registerMessage]);

  if (!hasChildren) {
    return null;
  }

  return (
    <p
      aria-live={invalid ? "polite" : undefined}
      className={cn(
        "text-sm font-medium",
        invalid ? "text-destructive" : "text-foreground",
        className,
      )}
      id={messageId}
      ref={ref}
      role={invalid ? "alert" : undefined}
      {...props}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage };
