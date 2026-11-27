"use client";

import * as React from "react";

import {
  Popover as PopoverRoot,
  PopoverContent as PopoverContentPart,
  PopoverTrigger as PopoverTriggerPart,
} from "@ui-sdk/react/popover";

import type { MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import {
  asChildProps,
  closeAutoFocus,
  openAutoFocus,
  openState,
  Slot,
  useElementRef,
  useLazyElementRef,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import {
  DismissContext,
  type DismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
} from "../../../lib/ui-sdk-dismiss";
import { cn } from "../../../lib/utils";

type AnchorContextValue = {
  anchor: HTMLElement | null;
  setAnchor: (element: HTMLElement | null) => void;
};

const AnchorContext = React.createContext<AnchorContextValue | null>(null);

/** Holds the open state. Renders no element. */
const Popover = /* @__PURE__ */ named(
  "Popover",
  ({ onOpenChange, ...props }: React.ComponentProps<typeof PopoverRoot>) => {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const value = React.useMemo(() => ({ anchor, setAnchor }), [anchor]);
    const dismiss = useDismissRoot(onOpenChange);

    return (
      <AnchorContext value={value}>
        <DismissContext value={dismiss.ref}>
          <PopoverRoot onOpenChange={dismiss.handleOpenChange} {...props} />
        </DismissContext>
      </AnchorContext>
    );
  },
);

type TriggerProps = Omit<
  React.ComponentProps<typeof PopoverTriggerPart>,
  "render"
> & {
  asChild?: boolean;
};

const PopoverTrigger = /* @__PURE__ */ named(
  "PopoverTrigger",
  ({ asChild, children, ...props }: TriggerProps) => {
    const slot = asChildProps({ asChild, children });

    return (
      <PopoverTriggerPart
        render={withDataAttributes("button", openState, slot.render)}
        {...props}
      >
        {slot.children}
      </PopoverTriggerPart>
    );
  },
);

/**
 * Positions the content against this element instead of the trigger.
 */
const PopoverAnchor = /* @__PURE__ */ named(
  "PopoverAnchor",
  ({
    asChild,
    children,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  }) => {
    const setAnchor = React.use(AnchorContext)?.setAnchor;
    const [element, anchorReference] = useElementRef(ref);
    React.useEffect(() => {
      setAnchor?.(element);
      return () => setAnchor?.(null);
    }, [element, setAnchor]);

    return asChild ? (
      <Slot ref={anchorReference} {...props}>
        {children}
      </Slot>
    ) : (
      <div ref={anchorReference} {...props}>
        {children}
      </div>
    );
  },
);

type ContentProps = DismissHandlers &
  MaterialProps &
  Omit<React.ComponentProps<typeof PopoverContentPart>, "render"> & {
    asChild?: boolean;
    /** Keeps the panel in the page while closed, like Radix's `forceMount`. */
    forceMount?: boolean;
    /** Radix-compatible: `preventDefault()` keeps focus where the handler put it. */
    onCloseAutoFocus?: (event: Event) => void;
    /** Radix-compatible: `preventDefault()` keeps focus where the handler put it. */
    onOpenAutoFocus?: (event: Event) => void;
  };

/**
 * Popover panel. It renders as `role="dialog"`, so give it an accessible
 * name with `aria-label` or `aria-labelledby` (WAI-ARIA dialog pattern).
 */
const PopoverContent = /* @__PURE__ */ named(
  "PopoverContent",
  ({
    align = "center",
    asChild,
    children,
    className,
    finalFocus,
    forceMount,
    initialFocus,
    material = "glass",
    onCloseAutoFocus,
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onOpenAutoFocus,
    onPointerDownOutside,
    ref,
    sideOffset = 4,
    ...props
  }: ContentProps) => {
    const anchor = React.use(AnchorContext)?.anchor ?? undefined;
    const [content, contentReference] = useLazyElementRef(ref);
    const slot = asChildProps({ asChild, children });
    useRegisterDismissHandlers({
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    });
    // Radix gave the content no name of its own, so an `aria-label` named it.
    // ui-sdk labels it by the trigger; drop that when the caller names it.
    const hasOwnName =
      props["aria-label"] !== undefined &&
      props["aria-labelledby"] === undefined;
    const attributes = (state: { open: boolean }) => ({
      ...openState(state),
      ...(hasOwnName ? { "aria-labelledby": undefined } : {}),
    });

    return (
      <PopoverContentPart
        align={align}
        anchor={anchor}
        className={cn(
          "vllnt-glass-floating vllnt-glass-dense z-50 w-72 rounded-md border p-4 text-popover-foreground outline-none vllnt-radix-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        data-material={material}
        finalFocus={
          finalFocus ?? closeAutoFocus(onCloseAutoFocus, () => content.current)
        }
        initialFocus={
          initialFocus ?? openAutoFocus(() => content.current, onOpenAutoFocus)
        }
        keepMounted={forceMount}
        ref={contentReference}
        render={withDataAttributes("div", attributes, slot.render)}
        sideOffset={sideOffset}
        {...props}
      >
        {slot.children}
      </PopoverContentPart>
    );
  },
);

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
