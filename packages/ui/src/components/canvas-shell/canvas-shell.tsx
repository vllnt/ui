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
        "flex min-h-[720px] w-full flex-col overflow-hidden rounded-[1.75rem] border border-border/60 bg-background shadow-[0_20px_80px_hsl(var(--foreground)/0.08)]",
        className,
      )}
      ref={ref}
      {...props}
    >
      {topBar}
      <div className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.25))]">
        {leftRail ?? <div />}
        <div className="relative min-h-0 min-w-0 overflow-hidden">
          {children}
        </div>
        {rightDock ?? <div />}
      </div>
      {bottomSlot ? (
        <div className="border-t border-border/60 bg-background/80 px-4 py-2">
          {bottomSlot}
        </div>
      ) : null}
    </section>
  ),
);

CanvasShell.displayName = "CanvasShell";

export { CanvasShell };
