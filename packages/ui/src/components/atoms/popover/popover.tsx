"use client";

import * as React from "react";

import {
  PopoverContent as PopoverContentPart,
  Popover as PopoverRoot,
  PopoverTrigger as PopoverTriggerPart,
} from "@ui-sdk/react/popover";

import type { MaterialProps } from "../../../lib/material";
import {
  asChildProps,
  closeAutoFocus,
  openAutoFocus,
  openState,
  useComposedRef,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

type AnchorContextValue = {
  anchor: HTMLElement | null;
  setAnchor: (element: HTMLElement | null) => void;
};

const AnchorContext = React.createContext<AnchorContextValue | null>(null);

/** Holds the open state. Renders no element. */
const Popover = (props: React.ComponentProps<typeof PopoverRoot>) => {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const value = React.useMemo(() => ({ anchor, setAnchor }), [anchor]);

  return (
    <AnchorContext value={value}>
      <PopoverRoot {...props} />
    </AnchorContext>
  );
};
Popover.displayName = "Popover";

type TriggerProps = Omit<
  React.ComponentProps<typeof PopoverTriggerPart>,
  "render"
> & {
  asChild?: boolean;
};

const PopoverTrigger = ({ asChild, children, ...props }: TriggerProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <PopoverTriggerPart
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </PopoverTriggerPart>
  );
};
PopoverTrigger.displayName = "PopoverTrigger";

/**
 * Positions the content against this element instead of the trigger.
 */
const PopoverAnchor = ({
  asChild,
  children,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const setAnchor = React.use(AnchorContext)?.setAnchor;
  const own = React.useRef<HTMLDivElement | null>(null);
  const composed = useComposedRef(ref, own);
  const anchorReference = React.useCallback(
    (element: HTMLDivElement | null) => {
      setAnchor?.(element);
      return composed(element);
    },
    [composed, setAnchor],
  );

  if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
    return React.cloneElement(children, { ...props, ref: anchorReference });
  }

  return (
    <div ref={anchorReference} {...props}>
      {children}
    </div>
  );
};
PopoverAnchor.displayName = "PopoverAnchor";

type ContentProps = MaterialProps &
  Omit<React.ComponentProps<typeof PopoverContentPart>, "render"> & {
    asChild?: boolean;
    /** Radix-compatible: call `preventDefault()` to keep focus where it is. */
    onCloseAutoFocus?: (event: Event) => void;
    /** Radix-compatible: call `preventDefault()` to keep focus where it is. */
    onOpenAutoFocus?: (event: Event) => void;
  };

/**
 * Popover panel. It renders as `role="dialog"`, so give it an accessible
 * name with `aria-label` or `aria-labelledby` (WAI-ARIA dialog pattern).
 */
const PopoverContent = ({
  align = "center",
  asChild,
  children,
  className,
  finalFocus,
  initialFocus,
  material = "glass",
  onCloseAutoFocus,
  onOpenAutoFocus,
  ref,
  sideOffset = 4,
  ...props
}: ContentProps) => {
  const anchor = React.use(AnchorContext)?.anchor ?? undefined;
  const content = React.useRef<HTMLDivElement | null>(null);
  const contentReference = useComposedRef(ref, content);
  const slot = asChildProps({ asChild, children });

  return (
    <PopoverContentPart
      align={align}
      anchor={anchor}
      className={cn(
        "vllnt-glass-floating vllnt-glass-dense z-50 w-72 rounded-md border p-4 text-popover-foreground outline-none [--radix-popover-content-available-height:var(--available-height)] [--radix-popover-content-available-width:var(--available-width)] [--radix-popover-content-transform-origin:var(--transform-origin)] [--radix-popover-trigger-height:var(--anchor-height)] [--radix-popover-trigger-width:var(--anchor-width)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      data-material={material}
      finalFocus={finalFocus ?? closeAutoFocus(onCloseAutoFocus)}
      initialFocus={
        initialFocus ?? openAutoFocus(() => content.current, onOpenAutoFocus)
      }
      ref={contentReference}
      render={withDataAttributes("div", openState, slot.render)}
      sideOffset={sideOffset}
      {...props}
    >
      {slot.children}
    </PopoverContentPart>
  );
};
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
