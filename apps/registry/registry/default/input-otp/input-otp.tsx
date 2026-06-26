"use client";

import { use } from "react";

import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@vllnt/ui";

const InputOTP = ({
  className,
  containerClassName,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof OTPInput> & {
  ref?: React.Ref<React.ComponentRef<typeof OTPInput>>;
}) => (
  <OTPInput
    className={cn("disabled:cursor-not-allowed", className)}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    ref={ref}
    {...props}
  />
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<React.ComponentRef<"div">>;
}) => (
  <div className={cn("flex items-center", className)} ref={ref} {...props} />
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = ({
  className,
  index,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  index: number;
  ref?: React.Ref<React.ComponentRef<"div">>;
}) => {
  const inputOTPContext = use(OTPInputContext);
  const slot = inputOTPContext.slots[index];

  if (!slot) {
    return null;
  }

  const { char, hasFakeCaret, isActive } = slot;

  return (
    <div
      className={cn(
        "relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className,
      )}
      ref={ref}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      ) : null}
    </div>
  );
};
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = ({
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<React.ComponentRef<"div">>;
}) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
