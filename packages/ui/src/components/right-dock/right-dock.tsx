import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type RightDockProps = React.ComponentPropsWithoutRef<"aside"> & {
  footer?: ReactNode;
  header?: ReactNode;
  title?: ReactNode;
};

const RightDock = forwardRef<HTMLElement, RightDockProps>(
  ({ children, className, footer, header, title, ...props }, ref) => (
    <aside
      className={cn(
        "flex h-full min-w-[18rem] max-w-[24rem] shrink-0 flex-col border-l border-border/60 bg-background/95",
        className,
      )}
      ref={ref}
      {...props}
    >
      {header || title ? (
        <div className="border-b border-border/60 px-4 py-3">
          {title ? (
            <div className="text-sm font-medium text-foreground">{title}</div>
          ) : null}
          {header ? <div className="mt-2">{header}</div> : null}
        </div>
      ) : null}
      <div className="flex-1 overflow-auto p-4">{children}</div>
      {footer ? (
        <div className="border-t border-border/60 p-4">{footer}</div>
      ) : null}
    </aside>
  ),
);

RightDock.displayName = "RightDock";

export { RightDock };
