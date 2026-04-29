import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type LeftRailProps = React.ComponentPropsWithoutRef<"aside"> & {
  footer?: ReactNode;
  title?: ReactNode;
};

const LeftRail = forwardRef<HTMLElement, LeftRailProps>(
  ({ children, className, footer, title, ...props }, ref) => (
    <aside
      className={cn(
        "flex h-full w-[4.5rem] shrink-0 flex-col items-center gap-3 border-r border-border bg-background px-2 py-3",
        className,
      )}
      ref={ref}
      {...props}
    >
      {title ? (
        <div className="flex min-h-9 items-center text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          {title}
        </div>
      ) : null}
      <div className="flex w-full flex-1 flex-col items-center gap-2">
        {children}
      </div>
      {footer ? (
        <div className="flex w-full flex-col items-center gap-2">{footer}</div>
      ) : null}
    </aside>
  ),
);

LeftRail.displayName = "LeftRail";

export { LeftRail };
