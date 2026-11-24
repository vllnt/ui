"use client";

import * as React from "react";

import {
  PasswordInput as PasswordInputRoot,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "../../../lib/utils";

export type PasswordInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type"
> & {
  hideLabel?: string;
  showLabel?: string;
};

const PasswordInput = ({
  autoComplete,
  className,
  "data-slot": dataSlot,
  defaultValue,
  disabled,
  form,
  hideLabel = "Hide password",
  name,
  readOnly,
  ref: reference,
  required,
  showLabel = "Show password",
  value,
  ...props
}: PasswordInputProps & {
  "data-slot"?: string;
  ref?: React.Ref<HTMLInputElement>;
}) => (
  <PasswordInputRoot
    className="relative"
    defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
    disabled={disabled}
    form={form}
    name={name}
    readOnly={readOnly}
    required={required}
    value={value === undefined ? undefined : String(value)}
  >
    <PasswordInputControl
      {...props}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={reference}
      // ui-sdk fills in `autocomplete="current-password"` and its own
      // `data-slot`; keep the caller's values, or none, as before.
      render={(controlProps) => (
        <input
          {...controlProps}
          autoComplete={autoComplete}
          data-slot={dataSlot ?? controlProps["data-slot"]}
        />
      )}
    />
    <PasswordInputToggle
      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
      // The name says what a press does, so `aria-pressed` would say it twice.
      render={(toggleProps, { visible }) => (
        <button
          {...toggleProps}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={undefined}
          type="button"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    />
  </PasswordInputRoot>
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
