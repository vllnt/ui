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

type FormInstance<TFieldValues extends FieldValues> = UseFormReturn<
  TFieldValues,
  unknown,
  TFieldValues
>;

import { cn } from "../../lib/utils";
import { Label } from "../label";

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

export type FormProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  React.ComponentPropsWithoutRef<"form">,
  "children" | "onSubmit"
> & {
  children: FormRenderChildren<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  disabled?: boolean;
  form?: FormInstance<TFieldValues>;
  onError?: FormErrorHandler<TFieldValues>;
  onSubmit: FormSubmitHandler<TFieldValues>;
  resolver?: Resolver<TFieldValues>;
  schema?: Parameters<typeof zodResolver>[0];
  values?: TFieldValues;
};

type FormFieldContextValue = {
  name: string;
};

type FormItemContextValue = {
  id: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined,
);

const FormItemContext = React.createContext<FormItemContextValue | undefined>(
  undefined,
);

function useFormFieldContext(componentName: string) {
  const fieldContext = React.useContext(FormFieldContext);

  if (fieldContext === undefined) {
    throw new Error(`${componentName} must be used within FormField.`);
  }

  return fieldContext;
}

function useFormItemContext(componentName: string) {
  const itemContext = React.useContext(FormItemContext);

  if (itemContext === undefined) {
    throw new Error(`${componentName} must be used within FormItem.`);
  }

  return itemContext;
}

function composeIds(...ids: (string | undefined)[]) {
  const value = ids.filter((id) => id !== undefined && id.length > 0).join(" ");

  return value.length > 0 ? value : undefined;
}

function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  className,
  defaultValues,
  disabled = false,
  form: providedForm,
  onError,
  onSubmit,
  resolver,
  schema,
  values,
  ...props
}: FormProps<TFieldValues>) {
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
  const content = typeof children === "function" ? children(form) : children;

  return (
    <FormProvider {...form}>
      <form
        className={cn("space-y-6", className)}
        data-disabled={submitting ? "true" : undefined}
        data-submitting={form.formState.isSubmitting ? "true" : undefined}
        onSubmit={form.handleSubmit(
          async (values) => {
            await onSubmit(values, form);
          },
          async (errors) => {
            if (onError !== undefined) {
              await onError(errors, form);
            }
          },
        )}
        {...props}
      >
        {content}
      </form>
    </FormProvider>
  );
}

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
  const fieldContext = useFormFieldContext("useFormField");
  const itemContext = useFormItemContext("useFormField");
  const { formState, getFieldState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  const formItemId = `${itemContext.id}-form-item`;
  const formDescriptionId = `${itemContext.id}-form-item-description`;
  const formMessageId = `${itemContext.id}-form-item-message`;

  return {
    error: fieldState.error,
    formDescriptionId,
    formItemId,
    formMessageId,
    id: itemContext.id,
    invalid: fieldState.invalid,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isValidating: fieldState.isValidating,
    name: fieldContext.name,
  };
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const id = React.useId();
  const itemContextValue = React.useMemo(() => ({ id }), [id]);

  return (
    <FormItemContext.Provider value={itemContextValue}>
      <div className={cn("space-y-2", className)} ref={ref} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { formItemId, invalid } = useFormField();

  return (
    <Label
      className={cn(invalid && "text-destructive", className)}
      data-invalid={invalid ? "true" : undefined}
      htmlFor={props.htmlFor ?? formItemId}
      ref={ref}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

type FormControlProps = React.ComponentPropsWithoutRef<typeof Slot> & {
  disabled?: boolean;
};

const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  ({ ...props }, ref) => {
    const { error, formDescriptionId, formItemId, formMessageId, invalid } =
      useFormField();
    const { formState } = useFormContext();
    const describedBy = composeIds(
      props["aria-describedby"],
      formDescriptionId,
      invalid || error !== undefined ? formMessageId : undefined,
    );
    const disabled = props.disabled ?? formState.isSubmitting;

    return (
      <Slot
        {...props}
        {...(disabled ? ({ disabled: true } as { disabled: true }) : {})}
        aria-describedby={describedBy}
        aria-disabled={props["aria-disabled"] ?? (disabled || undefined)}
        aria-invalid={props["aria-invalid"] ?? (invalid || undefined)}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        id={props.id ?? formItemId}
        ref={ref}
      />
    );
  },
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      id={formDescriptionId}
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
  const { error, formMessageId, invalid } = useFormField();
  const body = error?.message ?? children;

  if (React.Children.count(body) === 0) {
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
      id={formMessageId}
      ref={ref}
      role={invalid ? "alert" : undefined}
      {...props}
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
