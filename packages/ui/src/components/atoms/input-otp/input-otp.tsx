"use client";

import * as React from "react";

import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
  type OTPInputSlotState,
} from "@ui-sdk/react/otp-input";
import { Dot } from "lucide-react";

import { named } from "../../../lib/named";
import type { NarrowPartProps } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

type SdkProps = React.ComponentProps<typeof OTPInput>;
type SdkPattern = NonNullable<SdkProps["pattern"]>;
type TextAlign = "center" | "end" | "left" | "right" | "start";

const PATTERN_KEYWORDS = new Set(["alphanumeric", "digits", "letters"]);
const ANY_CHARACTER = /[\S\s]/;
// ui-sdk's own default length; slots past `maxLength` render nothing.
const DEFAULT_MAX_LENGTH = 6;
const MaxLengthContext = React.createContext(DEFAULT_MAX_LENGTH);

type InputOTPProps = Omit<
  NarrowPartProps<SdkProps>,
  "onValueChange" | "onValueCommit" | "pattern" | "textAlign"
> & {
  /** Class names for the wrapper element (the root). Merged with `className`. */
  containerClassName?: string;
  /** Runs with the whole code on every change. */
  onChange?: (value: string) => void;
  /** Runs with the whole code once every slot has a character. */
  onComplete?: (value: string) => void;
  /**
   * Which characters a code accepts: `"digits"`, `"letters"`, `"alphanumeric"`,
   * a `RegExp` that each character must match, or a regular expression string
   * such as `"^\d+$"`, which also has to match each single character.
   * Without a pattern, any character works.
   */
  pattern?: SdkPattern | (string & {});
  ref?: React.Ref<HTMLInputElement>;
  /** `"left"` and `"right"` mean the same as `"start"` and `"end"`. */
  textAlign?: TextAlign;
};

const SDK_TEXT_ALIGN: Record<TextAlign, "center" | "end" | "start"> = {
  center: "center",
  end: "end",
  left: "start",
  right: "end",
  start: "start",
};

// ui-sdk callbacks get a details argument too; input-otp's got the code alone.
const codeOnly = (callback: ((value: string) => void) | undefined) =>
  callback
    ? (value: string) => {
        callback(value);
      }
    : undefined;

const InputOTP = /* @__PURE__ */ named(
  "InputOTP",
  ({
    className,
    containerClassName,
    inputMode,
    maxLength = DEFAULT_MAX_LENGTH,
    onChange,
    onComplete,
    pattern,
    ref: reference,
    textAlign,
    ...props
  }: InputOTPProps) => {
    const sdkPattern = React.useMemo<SdkPattern>(
      () =>
        pattern === undefined
          ? ANY_CHARACTER
          : typeof pattern === "string" && !PATTERN_KEYWORDS.has(pattern)
            ? new RegExp(pattern)
            : (pattern as SdkPattern),
      [pattern],
    );

    // The ref targets the real <input>, as before; the sdk's root is a <div>.
    const rootReference = React.useCallback(
      (root: HTMLDivElement | null) => {
        const input = root?.querySelector("input") ?? null;
        if (typeof reference === "function") {
          reference(input);
        } else if (reference) {
          reference.current = input;
        }
      },
      [reference],
    );

    return (
      <MaxLengthContext value={maxLength}>
        <OTPInput
          className={cn(
            "flex items-center gap-2 has-[:disabled]:opacity-50 [&>input:disabled]:cursor-not-allowed",
            containerClassName,
            className,
          )}
          inputMode={
            inputMode ?? (sdkPattern === pattern ? undefined : "numeric")
          }
          maxLength={maxLength}
          onValueChange={codeOnly(onChange)}
          onValueCommit={codeOnly(onComplete)}
          pattern={sdkPattern}
          ref={rootReference}
          textAlign={textAlign ? SDK_TEXT_ALIGN[textAlign] : undefined}
          {...props}
        />
      </MaxLengthContext>
    );
  },
);

const InputOTPGroup = /* @__PURE__ */ named(
  "InputOTPGroup",
  ({
    className,
    ref,
    ...props
  }: NarrowPartProps<React.ComponentProps<typeof OTPInputGroup>>) => (
    <OTPInputGroup
      className={cn("flex items-center", className)}
      ref={ref}
      {...props}
    />
  ),
);

const slotContent = ({ char, hasFakeCaret }: OTPInputSlotState) => (
  <>
    {char}
    {hasFakeCaret ? (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000 motion-reduce:animate-none" />
      </div>
    ) : null}
  </>
);

const InputOTPSlot = /* @__PURE__ */ named(
  "InputOTPSlot",
  ({
    className,
    index,
    ref,
    ...props
  }: NarrowPartProps<React.ComponentProps<typeof OTPInputSlot>>) => {
    const maxLength = React.use(MaxLengthContext);

    if (index >= maxLength) {
      return null;
    }

    const slotClassName = ({ active }: OTPInputSlotState) =>
      cn(
        "relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        active && "z-10 ring-2 ring-ring ring-offset-background",
        className,
      );

    return (
      <OTPInputSlot
        className={slotClassName}
        index={index}
        ref={ref}
        {...props}
      >
        {slotContent}
      </OTPInputSlot>
    );
  },
);

const InputOTPSeparator = /* @__PURE__ */ named(
  "InputOTPSeparator",
  ({
    ref,
    ...props
  }: NarrowPartProps<React.ComponentProps<typeof OTPInputSeparator>>) => (
    <OTPInputSeparator ref={ref} role="separator" {...props}>
      <Dot />
    </OTPInputSeparator>
  ),
);

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
