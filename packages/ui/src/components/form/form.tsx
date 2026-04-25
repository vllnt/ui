"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  type ControllerProps,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type Resolver,
  type SubmitErrorHandler,
  useForm,
  useFormContext,
  type UseFormReturn,
} from "react-hook-form";

import { cn } from "../../lib/utils";
import { Label } from "../label";

type FormInstance<TFieldValues extends FieldValues> = UseFormReturn<
  TFieldValues,
  unknown,
  TFieldValues
>;

type FormRenderChildren<TFieldValues extends FieldValues> =
  | ((form: FormInstance<TFieldValues>) => React.ReactNode)
  | React.ReactNode;

type FormSubmitHandler<TFieldValues extends FieldValues> = (
  values: TFieldValues,
  form: FormInstance<TFieldValues>,
) => Promise<void> | void;

type FormErrorHandler<TFieldValues extends FieldValues> = (
  errors: Parameters<SubmitErrorHandler<TFieldValues>>[0],
  form: FormInstance<TFieldValues>,
) => Promise<void> | void;

type BaseFormProps<TFieldValues extends FieldValues> = Omit<
  React.ComponentPropsWithoutRef<"form">,
  "children"
> & {
  children?: FormRenderChildren<TFieldValues>;
  controlId?: string;
  descriptionId?: string;
  disabled?: boolean;
  invalid?: boolean;
  messageId?: string;
  onError?: FormErrorHandler<TFieldValues>;
  onValidSubmit?: FormSubmitHandler<TFieldValues>;
  required?: boolean;
};

type ManagedFormProps<TFieldValues extends FieldValues> = {
  defaultValues?: DefaultValues<TFieldValues>;
  form?: undefined;
  resolver?: Resolver<TFieldValues>;
  schema?: Parameters<typeof zodResolver>[0];
  values?: TFieldValues;
};

type ProvidedFormProps<TFieldValues extends FieldValues> = {
  defaultValues?: never;
  form: FormInstance<TFieldValues>;
  resolver?: never;
  schema?: never;
  values?: never;
};

export type FormProps<TFieldValues extends FieldValues = FieldValues> =
  BaseFormProps<TFieldValues> &
    (ManagedFormProps<TFieldValues> | ProvidedFormProps<TFieldValues>);

type FormNativeSubmitHandler =
  React.ComponentPropsWithoutRef<"form">["onSubmit"];

type FormRootContextValue = {
  controlId?: string;
  descriptionId?: string;
  disabled: boolean;
  invalid: boolean;
  messageId?: string;
  required: boolean;
};

type FormFieldContextValue = {
  name: string;
};

type FormItemContextValue = {
  controlId: string;
  descriptionId: string;
  disabled: boolean;
  hasDescription: boolean;
  hasMessage: boolean;
  hasMessageSlot: boolean;
  id: string;
  invalid: boolean;
  messageId: string;
  required: boolean;
};

const FormRootContext = React.createContext<FormRootContextValue | undefined>(
  undefined,
);

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
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

function hasFormChild(
  children: React.ReactNode,
  name: "FormDescription" | "FormMessage",
): boolean {
  return React.Children.toArray(children).some((child) => {
    if (isNamedFormChild(child, name)) {
      return true;
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return hasFormChild(child.props.children, name);
    }

    return false;
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

function createManagedSubmitHandler<TFieldValues extends FieldValues>(
  form: FormInstance<TFieldValues>,
  onValidSubmit: FormSubmitHandler<TFieldValues> | undefined,
  onError: FormErrorHandler<TFieldValues> | undefined,
): ReturnType<FormInstance<TFieldValues>["handleSubmit"]> | undefined {
  if (onValidSubmit === undefined && onError === undefined) {
    return undefined;
  }

  return form.handleSubmit(
    async (submittedValues) => {
      if (onValidSubmit !== undefined) {
        await onValidSubmit(submittedValues, form);
      }
    },
    async (errors) => {
      if (onError !== undefined) {
        await onError(errors, form);
      }
    },
  );
}

function createSubmitHandler(
  nativeSubmit: FormNativeSubmitHandler,
  handleValidatedSubmit:
    | ((event?: React.BaseSyntheticEvent) => Promise<void>)
    | undefined,
): FormNativeSubmitHandler {
  return async (event) => {
    nativeSubmit?.(event);

    if (handleValidatedSubmit && !event.defaultPrevented) {
      await handleValidatedSubmit(event);
    }
  };
}

function FormInner<TFieldValues extends FieldValues = FieldValues>(
  {
    children,
    className,
    controlId,
    defaultValues,
    descriptionId,
    disabled = false,
    form: providedForm,
    invalid = false,
    messageId,
    onError,
    onSubmit,
    onValidSubmit,
    required = false,
    resolver,
    schema,
    values,
    ...props
  }: FormProps<TFieldValues>,
  ref: React.ForwardedRef<HTMLFormElement>,
) {
  const internalForm = useForm<TFieldValues>({
    defaultValues,
    resolver:
      schema === undefined
        ? resolver
        : (zodResolver(schema) as Resolver<TFieldValues>),
    values,
  });
  const form: FormInstance<TFieldValues> = providedForm ?? internalForm;
  const submitting = disabled || form.formState.isSubmitting;
  const rootContextValue = React.useMemo<FormRootContextValue>(
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
  const handleValidatedSubmit = createManagedSubmitHandler(
    form,
    onValidSubmit,
    onError,
  );
  const submitHandler =
    onSubmit === undefined && handleValidatedSubmit === undefined
      ? undefined
      : createSubmitHandler(onSubmit, handleValidatedSubmit);

  return (
    <FormRootContext.Provider value={rootContextValue}>
      <FormProvider {...form}>
        <form
          className={cn("space-y-2", className)}
          data-disabled={submitting ? "true" : undefined}
          data-invalid={invalid ? "true" : undefined}
          data-submitting={form.formState.isSubmitting ? "true" : undefined}
          onSubmit={submitHandler}
          ref={ref}
          {...props}
        >
          {typeof children === "function" ? children(form) : children}
        </form>
      </FormProvider>
    </FormRootContext.Provider>
  );
}

const FormBase = React.forwardRef(FormInner);
FormBase.displayName = "Form";

const Form = FormBase as <TFieldValues extends FieldValues = FieldValues>(
  props: FormProps<TFieldValues> & React.RefAttributes<HTMLFormElement>,
) => React.ReactElement;

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  const fieldContextValue = React.useMemo(
    () => ({ name: props.name }),
    [props.name],
  );

  return (
    <FormFieldContext.Provider value={fieldContextValue}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = useFormItemContext("useFormField");
  const { formState, getFieldState } = useFormContext();

  if (fieldContext === undefined) {
    return {
      disabled: itemContext.disabled,
      error: undefined,
      formDescriptionId: itemContext.descriptionId,
      formItemId: itemContext.controlId,
      formMessageId: itemContext.messageId,
      hasDescription: itemContext.hasDescription,
      hasMessage: itemContext.hasMessage,
      hasMessageSlot: itemContext.hasMessageSlot,
      id: itemContext.id,
      invalid: itemContext.invalid,
      isDirty: false,
      isTouched: false,
      isValidating: false,
      name: "",
      required: itemContext.required,
    };
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    disabled: itemContext.disabled,
    error: fieldState.error,
    formDescriptionId: itemContext.descriptionId,
    formItemId: itemContext.controlId,
    formMessageId: itemContext.messageId,
    hasDescription: itemContext.hasDescription,
    hasMessage: itemContext.hasMessage,
    hasMessageSlot: itemContext.hasMessageSlot,
    id: itemContext.id,
    invalid: itemContext.invalid || fieldState.invalid,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isValidating: fieldState.isValidating,
    name: fieldContext.name,
    required: itemContext.required,
  };
}

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
    const hasMessageSlot = hasFormChild(children, "FormMessage");

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
        hasMessageSlot,
        id: generatedId,
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
        hasMessageSlot,
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
  const { formItemId, invalid } = useFormField();

  return (
    <Label
      className={cn(invalid && "text-destructive", className)}
      data-invalid={invalid ? "true" : undefined}
      htmlFor={htmlFor ?? formItemId}
      ref={ref}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

type FormControlProps = React.ComponentPropsWithoutRef<typeof Slot> & {
  disabled?: boolean;
  required?: boolean;
};

const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  (
    { disabled: controlDisabled, id: _id, required: controlRequired, ...props },
    ref,
  ) => {
    const {
      disabled,
      error,
      formDescriptionId,
      formItemId,
      formMessageId,
      hasDescription,
      hasMessage,
      hasMessageSlot,
      invalid,
      required,
    } = useFormField();
    const { formState } = useFormContext();
    const hasErrorMessage = hasVisibleContent(error?.message);
    const describedBy = composeIds(
      props["aria-describedby"],
      hasDescription ? formDescriptionId : undefined,
      error === undefined
        ? hasMessage && invalid
          ? formMessageId
          : undefined
        : hasMessageSlot && hasErrorMessage
          ? formMessageId
          : undefined,
    );
    const effectiveDisabled =
      controlDisabled ?? (disabled || formState.isSubmitting);
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
        id={formItemId}
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
  const { formDescriptionId } = useFormField();

  return (
    <p
      {...props}
      className={cn("text-sm text-muted-foreground", className)}
      id={formDescriptionId}
      ref={ref}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ children, className, id: _id, ...props }, ref) => {
  const { error, formMessageId, invalid } = useFormField();
  const body = error?.message ?? children;

  if (!hasVisibleContent(body)) {
    return null;
  }

  return (
    <p
      {...props}
      className={cn(
        "text-sm font-medium",
        invalid || error !== undefined ? "text-destructive" : "text-foreground",
        className,
      )}
      id={formMessageId}
      ref={ref}
      role={invalid || error !== undefined ? "alert" : undefined}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
