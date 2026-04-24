import { forwardRef } from "react";

import { cn } from "../../lib/utils";

export type AnchorPortProps = React.ComponentPropsWithoutRef<"span"> & {
  side?: "bottom" | "left" | "right" | "top";
  state?: "active" | "blocked" | "idle";
  tone?: "bidirectional" | "input" | "output";
};

const toneClasses: Record<NonNullable<AnchorPortProps["tone"]>, string> = {
  bidirectional:
    "border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300",
  input: "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300",
  output:
    "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

const stateClasses: Record<NonNullable<AnchorPortProps["state"]>, string> = {
  active: "scale-100 opacity-100",
  blocked: "opacity-60 saturate-50",
  idle: "opacity-80",
};

const sideClasses: Record<NonNullable<AnchorPortProps["side"]>, string> = {
  bottom: "self-end",
  left: "self-start",
  right: "self-end",
  top: "self-start",
};

const AnchorPort = forwardRef<HTMLSpanElement, AnchorPortProps>(
  (
    {
      className,
      side = "right",
      state = "idle",
      tone = "bidirectional",
      ...props
    },
    ref,
  ) => (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full border shadow-sm",
        toneClasses[tone],
        stateClasses[state],
        sideClasses[side],
        className,
      )}
      data-side={side}
      data-state={state}
      data-tone={tone}
      ref={ref}
      role="status"
      {...props}
    >
      <span className="size-2.5 rounded-full bg-current" />
    </span>
  ),
);

AnchorPort.displayName = "AnchorPort";

export { AnchorPort };
