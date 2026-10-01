"use client";

import type { KeyboardEvent } from "react";

import { cn } from "../../../lib/utils";
import { Input } from "../../atoms/input/input";

export type InlineInputProps = {
  /** Accessible name when no visible label is associated with the input. */
  "aria-label"?: string;
  /** Id of the element that labels the input. */
  "aria-labelledby"?: string;
  className?: string;
  /** Called when user presses Escape or blurs without changes. */
  onCancel?: () => void;
  /** Called when the input value changes. */
  onChange: (value: string) => void;
  /** Called when user presses Enter or blurs with changes. */
  onCommit: (value: string) => void;
  /** Current input value. */
  value: string;
};

/** Stable ref callback: focuses the input once when it mounts, like `autoFocus`. */
function focusOnMount(node: HTMLInputElement | null): void {
  node?.focus();
}

/**
 * Inline input for editing text with keyboard support.
 * - Enter: commits the value
 * - Escape: cancels editing
 * - Blur: commits the value
 */
export function InlineInput({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  onCancel,
  onChange,
  onCommit,
  value,
}: InlineInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onCommit(value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onCancel?.();
    }
  };

  return (
    <Input
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn("flex-1 h-7 text-sm", className)}
      onBlur={() => {
        onCommit(value);
      }}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={handleKeyDown}
      ref={focusOnMount}
      value={value}
    />
  );
}
