import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type ObjectHandleProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "type"
> & {
  hint?: ReactNode;
  label?: ReactNode;
};

const ObjectHandle = forwardRef<HTMLButtonElement, ObjectHandleProps>(
  ({ className, hint, label = "Move", ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-border hover:text-foreground",
        className,
      )}
      ref={ref}
      type="button"
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid grid-cols-2 gap-0.5 text-[8px] leading-none"
      >
        <span>•</span>
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </span>
      <span>{label}</span>
      {hint ? <span className="text-muted-foreground/80">{hint}</span> : null}
    </button>
  ),
);

ObjectHandle.displayName = "ObjectHandle";

export { ObjectHandle };
