"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import type { MaterialProps } from "../../../lib/material";
import { cn } from "../../../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({
  className,
  material = "glass",
  ref,
  sideOffset = 4,
  ...props
}: MaterialProps &
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    ref?: React.Ref<React.ComponentRef<typeof TooltipPrimitive.Content>>;
  }) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn(
        "vllnt-glass vllnt-glass-dense z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      data-material={material}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    />
  </TooltipPrimitive.Portal>
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
