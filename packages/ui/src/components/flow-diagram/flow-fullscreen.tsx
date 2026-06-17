"use client";

import { memo } from "react";

import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { useEscapeKey } from "../../lib/use-escape-key";
import { cn } from "../../lib/utils";

import type { FlowFullscreenProps } from "./types";

export const FlowFullscreen = memo(function FlowFullscreen({
  children,
  isOpen,
  onClose,
}: FlowFullscreenProps) {
  useEscapeKey(onClose, { enabled: isOpen, target: "document" });

  if (!isOpen) return null;

  // Render portal on client side
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-label="Flow diagram fullscreen view"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col bg-background",
        "animate-in fade-in duration-200",
      )}
      role="dialog"
    >
      {/* Header with close button */}
      <div className="flex h-12 items-center justify-end border-b border-border px-4">
        <button
          aria-label="Close fullscreen"
          className="flex size-8 items-center justify-center rounded hover:bg-muted transition-colors"
          onClick={onClose}
          title="Close fullscreen (Esc)"
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>,
    document.body,
  );
});
