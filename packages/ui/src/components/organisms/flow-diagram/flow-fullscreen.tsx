"use client";

import { memo } from "react";

import { Dialog, DialogClose, DialogContent } from "@ui-sdk/react/dialog";
import { X } from "lucide-react";

import { openAliases } from "../../../lib/ui-sdk-dialog";
import { cn } from "../../../lib/utils";

import type { FlowFullscreenProps } from "./types";

/**
 * The diagram fills the screen in the browser top layer. ui-sdk's modal dialog
 * traps focus, locks page scroll, closes on Escape and gives focus back to the
 * element that opened it. It paints no material and no veil: the panel is the
 * page background.
 */
export const FlowFullscreen = memo(function FlowFullscreen({
  children,
  isOpen,
  onClose,
  onOpenChange,
  open,
}: FlowFullscreenProps) {
  const state = openAliases({ isOpen, onClose, onOpenChange, open });

  return (
    <Dialog onOpenChange={state.handleOpenChange} open={state.open}>
      <DialogContent
        aria-label="Flow diagram fullscreen view"
        className={cn(
          "fixed inset-0 z-[9999] m-0 flex size-full max-h-none max-w-none flex-col border-0 bg-background p-0 text-foreground",
          "animate-in fade-in duration-200",
        )}
      >
        {/* Header with close button */}
        <div className="flex h-12 items-center justify-end border-b border-border px-4">
          <DialogClose
            aria-label="Close fullscreen"
            className="flex size-8 items-center justify-center rounded hover:bg-secondary transition-colors"
            title="Close fullscreen (Esc)"
          >
            <X className="size-5" />
          </DialogClose>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </DialogContent>
    </Dialog>
  );
});
