import { forwardRef } from "react";

import { cva } from "class-variance-authority";
import { LoaderCircle, SendHorizontal } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Textarea } from "../textarea";

const formShellVariants = cva(
  "rounded-2xl border border-border/70 bg-background shadow-sm",
);

function AIChatInputFooter({
  currentLength,
  helperText,
  isSubmitDisabled,
  isSubmitting,
  maxLength,
  status,
  submitLabel,
}: {
  currentLength: number;
  helperText?: string;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  maxLength?: number;
  status?: string;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1 text-xs text-muted-foreground">
        {helperText ? <p>{helperText}</p> : null}
        <div className="flex flex-wrap items-center gap-2">
          {status ? <span>{status}</span> : null}
          {typeof maxLength === "number" ? (
            <span>
              {currentLength}/{maxLength}
            </span>
          ) : null}
        </div>
      </div>

      <Button
        className="self-start rounded-full px-4 sm:self-auto"
        disabled={isSubmitDisabled}
        type="submit"
      >
        {isSubmitting ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <SendHorizontal className="mr-2 h-4 w-4" />
        )}
        {submitLabel}
      </Button>
    </div>
  );
}

export type AIChatInputProps = React.ComponentPropsWithoutRef<"form"> & {
  /** Disables editing and submit actions. */
  disabled?: boolean;
  /** Optional helper text shown below the prompt field. */
  helperText?: string;
  /** Whether the submit action is in progress. */
  isSubmitting?: boolean;
  /** Called whenever the textarea value changes. */
  onValueChange?: (value: string) => void;
  /** Optional status text shown beside helper copy. */
  status?: string;
  /** Label for the submit button. */
  submitLabel?: string;
  /** Props forwarded to the textarea primitive. */
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  /** Optional controls rendered above the footer row. */
  toolbar?: React.ReactNode;
  /** Controlled textarea value. */
  value?: string;
};

const AIChatInput = forwardRef<HTMLFormElement, AIChatInputProps>(
  (
    {
      className,
      disabled = false,
      helperText,
      isSubmitting = false,
      onSubmit,
      onValueChange,
      status,
      submitLabel = "Send",
      textareaProps,
      toolbar,
      value,
      ...props
    },
    ref,
  ) => {
    const currentValue = value ?? "";
    const maxLength = textareaProps?.maxLength;
    const isSubmitDisabled =
      disabled || isSubmitting || currentValue.trim().length === 0;

    return (
      <form
        className={cn(formShellVariants(), "w-full p-3", className)}
        onSubmit={onSubmit}
        ref={ref}
        {...props}
      >
        <div className="space-y-3">
          <Textarea
            className="min-h-[120px] resize-none rounded-xl border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
            onChange={(event) => {
              textareaProps?.onChange?.(event);
              onValueChange?.(event.target.value);
            }}
            placeholder="Ask a follow-up question, paste context, or describe what you need..."
            value={value}
            {...textareaProps}
          />

          {toolbar ? (
            <div className="flex flex-wrap gap-2">{toolbar}</div>
          ) : null}

          <AIChatInputFooter
            currentLength={currentValue.length}
            helperText={helperText}
            isSubmitDisabled={isSubmitDisabled}
            isSubmitting={isSubmitting}
            maxLength={maxLength}
            status={status}
            submitLabel={submitLabel}
          />
        </div>
      </form>
    );
  },
);

AIChatInput.displayName = "AIChatInput";

export { AIChatInput };
