"use client";

import { memo, useRef } from "react";

import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { useEscapeKey } from "../../../lib/use-escape-key";
import { useFocusContainment } from "../../../lib/use-focus-containment";
import { cn } from "../../../lib/utils";

import type { FlowFullscreenProps } from "./types";

export const FlowFullscreen = memo(function FlowFullscreen({
  children,
  isOpen,
  onClose,
}: FlowFullscreenProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useFocusContainment(dialogRef, isOpen);
  useEscapeKey(onClose, { enabled: isOpen, target: "document" });

  if (!isOpen) return null;

  // Render portal on client side
  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      aria-label="Flow diagram fullscreen view"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[9999] m-0 flex size-full max-w-none flex-col bg-background text-foreground",
        "animate-in fade-in duration-200",
      )}
      open
      ref={dialogRef}
    >
      {/* Header with close button */}
      <div className="flex h-12 items-center justify-end border-b border-border px-4">
        <button
          aria-label="Close fullscreen"
          className="flex size-8 items-center justify-center rounded hover:bg-secondary transition-colors"
          onClick={onClose}
          title="Close fullscreen (Esc)"
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </dialog>,
    document.body,
  );
});
