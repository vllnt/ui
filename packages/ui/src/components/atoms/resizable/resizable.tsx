"use client";

import * as React from "react";

import {
  Resizable,
  ResizableHandle as ResizableHandlePart,
  ResizablePanel as ResizablePanelPart,
} from "@ui-sdk/react/resizable";
import { GripVertical } from "lucide-react";

import { cn } from "../../../lib/utils";

type GroupProps = React.ComponentProps<typeof Resizable> & {
  /** The direction the panels lay out in. Same as `orientation`. */
  direction?: "horizontal" | "vertical";
};

const ResizablePanelGroup = ({
  className,
  direction,
  orientation = direction,
  ...props
}: GroupProps) => (
  <Resizable
    className={cn(
      "flex h-full w-full overflow-hidden data-[orientation=vertical]:flex-col",
      className,
    )}
    orientation={orientation}
    {...props}
  />
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePanelPart>) => (
  <ResizablePanelPart className={cn("overflow-auto", className)} {...props} />
);
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = ({
  className,
  withHandle,
  ...props
}: React.ComponentProps<typeof ResizableHandlePart> & {
  withHandle?: boolean;
}) => (
  <ResizableHandlePart
    aria-label="Resize"
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 data-[orientation=vertical]:[&>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle ? (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="size-2.5" />
      </div>
    ) : null}
  </ResizableHandlePart>
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
