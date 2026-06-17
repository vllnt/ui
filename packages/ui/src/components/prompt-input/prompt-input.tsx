"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LoaderCircle, SendHorizontal } from "lucide-react";

import { cn } from "../../lib/utils";

const SUBMIT_KEY = "Enter";
const REM_PER_ROW = 1.5;

function autoResize(element: HTMLTextAreaElement | null): void {
  if (element === null) {
    return;
  }
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

export type PromptInputProps = {
  className?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Disables editing and sending. */
  disabled?: boolean;
  /** Shows a spinner while a request runs. */
  isLoading?: boolean;
  /** Row count before the field scrolls. */
  maxRows?: number;
  /** Row count at rest; sets the initial height. */
  minRows?: number;
  /** Called with the value on submit. */
  onSubmit?: (value: string) => void;
  /** Called whenever the value changes. */
  onValueChange?: (value: string) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Accessible label for the submit button. */
  submitLabel?: string;
  /** Optional controls rendered to the left of the submit button. */
  toolbar?: React.ReactNode;
  /** Controlled value. */
  value?: string;
};

function applyRef(
  ref: React.Ref<HTMLTextAreaElement> | undefined,
  node: HTMLTextAreaElement | null,
): void {
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  if (ref) {
    ref.current = node;
  }
}

function useMergedRef(ref: React.Ref<HTMLTextAreaElement> | undefined): {
  assignRef: (node: HTMLTextAreaElement | null) => void;
  innerRef: React.RefObject<HTMLTextAreaElement | null>;
} {
  const innerRef = useRef<HTMLTextAreaElement>(null);

  const assignRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      applyRef(ref, node);
    },
    [ref],
  );

  return { assignRef, innerRef };
}

function usePromptInput({
  defaultValue,
  isControlled,
  onSubmit,
  onValueChange,
  ref,
  value,
}: {
  defaultValue: string;
  isControlled: boolean;
  onSubmit?: (value: string) => void;
  onValueChange?: (value: string) => void;
  ref?: React.Ref<HTMLTextAreaElement>;
  value?: string;
}) {
  const { assignRef, innerRef } = useMergedRef(ref);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? (value ?? "") : internalValue;

  useEffect(() => {
    autoResize(innerRef.current);
  }, [currentValue, innerRef]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }
      onValueChange?.(event.target.value);
    },
    [isControlled, onValueChange],
  );

  const submit = useCallback(() => {
    if (currentValue.trim().length === 0) {
      return;
    }
    onSubmit?.(currentValue);
    if (!isControlled) {
      setInternalValue("");
    }
  }, [currentValue, isControlled, onSubmit]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === SUBMIT_KEY && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const handleFormSubmit = useCallback(
    (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );

  return {
    assignRef,
    currentValue,
    handleChange,
    handleFormSubmit,
    handleKeyDown,
  };
}

function PromptInputActions({
  canSubmit,
  isLoading,
  submitLabel,
  toolbar,
}: {
  canSubmit: boolean;
  isLoading: boolean;
  submitLabel: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">{toolbar}</div>
      <button
        aria-label={submitLabel}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        disabled={!canSubmit}
        type="submit"
      >
        {isLoading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <SendHorizontal className="size-4" />
        )}
      </button>
    </div>
  );
}

/**
 * Auto-growing prompt textarea with a submit affordance and optional toolbar.
 *
 * Works controlled (`value` + `onValueChange`) or uncontrolled
 * (`defaultValue`). The field grows with its content between `minRows` and
 * `maxRows`, then scrolls. Enter submits; Shift+Enter inserts a newline.
 *
 * @example
 * <PromptInput onSubmit={(text) => send(text)} />
 */
export const PromptInput = ({
  className,
  defaultValue = "",
  disabled = false,
  isLoading = false,
  maxRows = 8,
  minRows = 1,
  onSubmit,
  onValueChange,
  placeholder = "Send a message…",
  ref,
  submitLabel = "Send",
  toolbar,
  value,
}: PromptInputProps & { ref?: React.Ref<HTMLTextAreaElement> }) => {
  const isControlled = value !== undefined;
  const {
    assignRef,
    currentValue,
    handleChange,
    handleFormSubmit,
    handleKeyDown,
  } = usePromptInput({
    defaultValue,
    isControlled,
    onSubmit,
    onValueChange,
    ref,
    value,
  });

  const canSubmit = !disabled && !isLoading && currentValue.trim().length > 0;

  return (
    <form
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
      onSubmit={handleFormSubmit}
    >
      <textarea
        aria-label={placeholder}
        className="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={assignRef}
        style={{
          maxHeight: `${maxRows * REM_PER_ROW}rem`,
          minHeight: `${minRows * REM_PER_ROW}rem`,
          overflowY: "auto",
        }}
        value={currentValue}
      />
      <PromptInputActions
        canSubmit={canSubmit}
        isLoading={isLoading}
        submitLabel={submitLabel}
        toolbar={toolbar}
      />
    </form>
  );
};
PromptInput.displayName = "PromptInput";
