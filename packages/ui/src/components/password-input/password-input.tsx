"use client";

import * as React from "react";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "../../lib/utils";

export type PasswordInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type"
> & {
  hideLabel?: string;
  showLabel?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      hideLabel = "Hide password",
      showLabel = "Show password",
      ...props
    },
    reference,
  ) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={reference}
          type={visible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => {
            setVisible((previous) => !previous);
          }}
          type="button"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
