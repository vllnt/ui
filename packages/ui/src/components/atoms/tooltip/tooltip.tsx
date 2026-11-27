"use client";

import * as React from "react";

import {
  Tooltip as TooltipRoot,
  TooltipContent as TooltipContentPart,
  TooltipTrigger as TooltipTriggerPart,
} from "@ui-sdk/react/tooltip";

import type { MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import {
  asChildProps,
  type DataAttributes,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import {
  DismissContext,
  type DismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
} from "../../../lib/ui-sdk-dismiss";
import { cn } from "../../../lib/utils";

/** A ui-sdk part's props with a plain string `className`, as Radix had. */
type PlainClass<Props> = Omit<Props, "className"> & { className?: string };

/** Radix's default: how long the pointer rests on a trigger before it opens. */
const DEFAULT_DELAY_DURATION = 700;

const DelayContext = React.createContext<number | undefined>(undefined);

type TooltipProviderProps = {
  children?: React.ReactNode;
  /** Milliseconds the pointer rests on a trigger before its tooltip opens. */
  delayDuration?: number;
  /** Radix-compatible: accepted for compatibility, ui-sdk groups tooltips itself. */
  disableHoverableContent?: boolean;
  /** Radix-compatible: accepted for compatibility, ui-sdk groups tooltips itself. */
  skipDelayDuration?: number;
};

/** Sets the default `delayDuration` of the tooltips inside. Renders no element. */
const TooltipProvider = /* @__PURE__ */ named(
  "TooltipProvider",
  ({
    children,
    delayDuration = DEFAULT_DELAY_DURATION,
  }: TooltipProviderProps) => (
    <DelayContext value={delayDuration}>{children}</DelayContext>
  ),
);

type TooltipProps = React.ComponentProps<typeof TooltipRoot> & {
  /** Milliseconds the pointer rests on the trigger before the tooltip opens. */
  delayDuration?: number;
};

const Tooltip = /* @__PURE__ */ named(
  "Tooltip",
  ({ delayDuration, onOpenChange, ...props }: TooltipProps) => {
    const provided = React.use(DelayContext);
    const dismiss = useDismissRoot(onOpenChange);

    return (
      <DismissContext value={dismiss.ref}>
        <TooltipRoot
          delay={delayDuration ?? provided ?? DEFAULT_DELAY_DURATION}
          onOpenChange={dismiss.handleOpenChange}
          {...props}
        />
      </DismissContext>
    );
  },
);

type TriggerProps = Omit<
  PlainClass<React.ComponentProps<typeof TooltipTriggerPart>>,
  "render"
> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

const triggerState = (state: { open: boolean }): DataAttributes => ({
  "data-state": state.open ? "delayed-open" : "closed",
});

const TooltipTrigger = /* @__PURE__ */ named(
  "TooltipTrigger",
  ({ asChild, children, ...props }: TriggerProps) => {
    const slot = asChildProps({ asChild, children });

    return (
      <TooltipTriggerPart
        render={withDataAttributes("button", triggerState, slot.render)}
        {...props}
      >
        {slot.children}
      </TooltipTriggerPart>
    );
  },
);

const contentState = (state: {
  instant: boolean;
  open: boolean;
}): DataAttributes => ({
  "data-state": state.open
    ? state.instant
      ? "instant-open"
      : "delayed-open"
    : "closed",
});

type ContentProps = DismissHandlers &
  MaterialProps &
  Omit<
    PlainClass<React.ComponentProps<typeof TooltipContentPart>>,
    "render"
  > & {
    asChild?: boolean;
    /**
     * Radix-compatible, no effect: ui-sdk keeps a closed tooltip in the page,
     * hidden, so there is nothing to force.
     */
    forceMount?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  };

const TooltipContent = /* @__PURE__ */ named(
  "TooltipContent",
  ({
    asChild,
    children,
    className,
    collisionPadding = 0,
    forceMount: _forceMount,
    material = "glass",
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
    ref,
    sideOffset = 4,
    ...props
  }: ContentProps) => {
    const slot = asChildProps({ asChild, children });
    useRegisterDismissHandlers({
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    });

    return (
      <TooltipContentPart
        className={cn(
          "vllnt-glass vllnt-glass-dense z-50 bg-transparent overflow-hidden rounded-md border px-3 py-1.5 text-sm text-popover-foreground animate-in fade-in-0 zoom-in-95 vllnt-radix-tooltip data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        collisionPadding={collisionPadding}
        data-material={material}
        ref={ref}
        render={withDataAttributes("div", contentState, slot.render)}
        sideOffset={sideOffset}
        {...props}
      >
        {slot.children}
      </TooltipContentPart>
    );
  },
);

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
