import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type BottomBarProps = React.ComponentPropsWithoutRef<"div"> & {
  center?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
};

const BottomBar = forwardRef<HTMLDivElement, BottomBarProps>(
  ({ center, className, leading, trailing, ...props }, ref) => (
    <div
      className={cn(
        "flex min-h-14 items-center gap-3 px-4 py-3 text-sm",
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">{leading}</div>
      {center ? (
        <div className="flex shrink-0 items-center justify-center gap-2">
          {center}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {trailing}
      </div>
    </div>
  ),
);

BottomBar.displayName = "BottomBar";

export { BottomBar };
