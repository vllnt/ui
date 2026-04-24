import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type GroupHullProps = React.ComponentPropsWithoutRef<"section"> & {
  description?: string;
  eyebrow?: ReactNode;
  title: string;
};

const GroupHull = forwardRef<HTMLElement, GroupHullProps>(
  ({ children, className, description, eyebrow, title, ...props }, ref) => (
    <section
      className={cn(
        "relative flex min-h-[280px] flex-col gap-4 rounded-[2rem] border border-dashed border-border/70 bg-muted/12 p-5",
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="absolute inset-3 rounded-[1.5rem] border border-border/40" />
      <div className="relative space-y-1">
        {eyebrow ? (
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="max-w-[48ch] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="relative flex flex-1 flex-wrap items-start gap-4">
        {children}
      </div>
    </section>
  ),
);

GroupHull.displayName = "GroupHull";

export { GroupHull };
