import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type TopBarProps = React.ComponentPropsWithoutRef<"header"> & {
  leading?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
  trailing?: ReactNode;
};

const TopBar = forwardRef<HTMLElement, TopBarProps>(
  (
    { children, className, leading, subtitle, title, trailing, ...props },
    ref,
  ) => (
    <header
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {leading ? (
          <div className="flex shrink-0 items-center gap-2">{leading}</div>
        ) : null}
        {title || subtitle ? (
          <div className="min-w-0">
            {title ? (
              <div className="truncate text-sm font-medium text-foreground">
                {title}
              </div>
            ) : null}
            {subtitle ? (
              <div className="truncate text-xs text-muted-foreground">
                {subtitle}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-1 items-center justify-center">
          {children}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {trailing}
      </div>
    </header>
  ),
);

TopBar.displayName = "TopBar";

export { TopBar };
