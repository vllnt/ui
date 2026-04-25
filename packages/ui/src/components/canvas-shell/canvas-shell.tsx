import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type CanvasShellProps = React.ComponentPropsWithoutRef<"section"> & {
  bottomSlot?: ReactNode;
  leftRail?: ReactNode;
  rightDock?: ReactNode;
  topBar?: ReactNode;
};

const CanvasShell = forwardRef<HTMLElement, CanvasShellProps>(
  (
    { bottomSlot, children, className, leftRail, rightDock, topBar, ...props },
    ref,
  ) => (
    <section
      className={cn(
        "flex min-h-[720px] w-full flex-col overflow-hidden rounded-md border border-border bg-background",
        className,
      )}
      ref={ref}
      {...props}
    >
      {topBar}
      <div className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden bg-background">
        {leftRail ?? <div />}
        <div className="relative min-h-0 min-w-0 overflow-hidden">
          {children}
        </div>
        {rightDock ?? <div />}
      </div>
      {bottomSlot ? (
        <div className="border-t border-border bg-background px-4 py-2">
          {bottomSlot}
        </div>
      ) : null}
    </section>
  ),
);

CanvasShell.displayName = "CanvasShell";

export { CanvasShell };
