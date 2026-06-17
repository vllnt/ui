import { forwardRef } from "react";

import { cn } from "../../lib/utils";

/** Props shared by the panel container and its `div`-based slots. */
export type PanelProps = React.HTMLAttributes<HTMLDivElement>;

/** Props for the {@link PanelTitle} heading. */
export type PanelTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

/** Props for the {@link PanelDescription}. */
export type PanelDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

/**
 * Bordered, titled content surface. Compose with {@link PanelHeader},
 * {@link PanelBody}, and {@link PanelFooter}.
 * @example
 * <Panel>
 *   <PanelHeader>
 *     <PanelTitle>Settings</PanelTitle>
 *     <PanelDescription>Manage your workspace.</PanelDescription>
 *   </PanelHeader>
 *   <PanelBody>...</PanelBody>
 *   <PanelFooter>...</PanelFooter>
 * </Panel>
 */
const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Panel.displayName = "Panel";

/** Header region, divided from the body by a bottom border. */
const PanelHeader = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b border-border px-4 py-3",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
PanelHeader.displayName = "PanelHeader";

/** Accessible heading for the panel. */
const PanelTitle = forwardRef<HTMLHeadingElement, PanelTitleProps>(
  ({ children, className, ...props }, ref) => (
    <h3
      className={cn(
        "text-sm font-semibold leading-none tracking-tight",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </h3>
  ),
);
PanelTitle.displayName = "PanelTitle";

/** Secondary descriptive text under the title. */
const PanelDescription = forwardRef<
  HTMLParagraphElement,
  PanelDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
));
PanelDescription.displayName = "PanelDescription";

/** Main content region of the panel. */
const PanelBody = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => (
    <div className={cn("px-4 py-3", className)} ref={ref} {...props} />
  ),
);
PanelBody.displayName = "PanelBody";

/** Footer region, divided from the body by a top border. */
const PanelFooter = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "flex items-center border-t border-border px-4 py-3",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
PanelFooter.displayName = "PanelFooter";

export {
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
};
