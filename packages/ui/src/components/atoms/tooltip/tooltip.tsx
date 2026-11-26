"use client";

import * as React from "react";

import {
  Tooltip as TooltipRoot,
  TooltipArrow as TooltipArrowPart,
  TooltipContent as TooltipContentPart,
  TooltipTrigger as TooltipTriggerPart,
} from "@ui-sdk/react/tooltip";

import type { MaterialProps } from "../../../lib/material";
import {
  asChildProps,
  type DataAttributes,
  withDataAttributes,
} from "../../../lib/ui-sdk";
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
const TooltipProvider = ({
  children,
  delayDuration = DEFAULT_DELAY_DURATION,
}: TooltipProviderProps) => (
  <DelayContext value={delayDuration}>{children}</DelayContext>
);
TooltipProvider.displayName = "TooltipProvider";

type TooltipProps = React.ComponentProps<typeof TooltipRoot> & {
  /**
   * Milliseconds the tooltip stays open once the pointer leaves the trigger
   * and the tooltip. Defaults to 0.
   */
  closeDelay?: number;
  /** Milliseconds the pointer rests on the trigger before the tooltip opens. */
  delayDuration?: number;
  /**
   * A press on the trigger (finger, mouse or keyboard) opens and closes the
   * tooltip, so it opens on touch screens too; an outside press or Escape
   * closes it. With a mouse, hovering opens it first, so the first press keeps
   * it open and the next closes it. Meant for an info button that exists to
   * show the tip. Defaults to off.
   */
  toggleable?: boolean;
};

const Tooltip = ({ delayDuration, ...props }: TooltipProps) => {
  const provided = React.use(DelayContext);

  return (
    <TooltipRoot
      delay={delayDuration ?? provided ?? DEFAULT_DELAY_DURATION}
      {...props}
    />
  );
};
Tooltip.displayName = "Tooltip";

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

const TooltipTrigger = ({ asChild, children, ...props }: TriggerProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <TooltipTriggerPart
      render={withDataAttributes("button", triggerState, slot.render)}
      {...props}
    >
      {slot.children}
    </TooltipTriggerPart>
  );
};
TooltipTrigger.displayName = "TooltipTrigger";

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

type ContentProps = MaterialProps &
  Omit<
    PlainClass<React.ComponentProps<typeof TooltipContentPart>>,
    "render"
  > & {
    asChild?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  };

const TooltipContent = ({
  asChild,
  children,
  className,
  collisionPadding = 0,
  material = "glass",
  ref,
  sideOffset = 4,
  ...props
}: ContentProps) => {
  const slot = asChildProps({ asChild, children });

  return (
    <TooltipContentPart
      className={cn(
        "vllnt-glass vllnt-glass-dense z-50 bg-transparent overflow-hidden has-[>[data-slot=tooltip-arrow]]:overflow-visible rounded-md border px-3 py-1.5 text-sm text-popover-foreground animate-in fade-in-0 zoom-in-95 [--radix-tooltip-content-available-height:var(--available-height)] [--radix-tooltip-content-available-width:var(--available-width)] [--radix-tooltip-content-transform-origin:var(--transform-origin)] [--radix-tooltip-trigger-height:var(--anchor-height)] [--radix-tooltip-trigger-width:var(--anchor-width)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
};
TooltipContent.displayName = "TooltipContent";

type ArrowProps = Omit<
  PlainClass<React.ComponentProps<typeof TooltipArrowPart>>,
  "render"
> & {
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Points at the trigger from the side the tooltip lands on, including after a
 * flip. Place it inside `TooltipContent`, which then stops clipping its
 * children. Hidden from assistive technology.
 */
const TooltipArrow = ({ className, ref, ...props }: ArrowProps) => (
  <TooltipArrowPart
    className={cn(
      // An 8 px square offset by half its size: the diamond's centre sits on
      // the content's edge, so it stays inside the 6 px padding.
      "size-2 rotate-45 bg-popover data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1",
      className,
    )}
    ref={ref}
    {...props}
  />
);
TooltipArrow.displayName = "TooltipArrow";

export {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};
