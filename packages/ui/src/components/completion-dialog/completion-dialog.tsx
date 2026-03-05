"use client";

import { memo, useCallback, useEffect, useRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

export type CompletionDialogProps = {
  cancelLabel?: string;
  cancelShortcut?: string;
  className?: string;
  closeIcon?: ReactNode;
  confirmLabel?: string;
  confirmShortcut?: string;
  description?: ReactNode;
  isOpen: boolean;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

type DialogContentProps = Omit<CompletionDialogProps, "isOpen">;

// eslint-disable-next-line max-lines-per-function -- Dialog content with keyboard handling
function DialogContent({
  cancelLabel = "Skip",
  cancelShortcut = "S",
  className,
  closeIcon,
  confirmLabel = "Done",
  confirmShortcut = "D",
  description,
  onCancel,
  onClose,
  onConfirm,
  title,
}: DialogContentProps): React.ReactNode {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        "relative z-10 w-full max-w-md mx-4 p-6 bg-background border border-border rounded-lg shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className,
      )}
    >
      <button
        aria-label="Close"
        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        onClick={onClose}
        type="button"
      >
        {closeIcon ?? (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        )}
      </button>
      <div className="mb-4">
        <h2 className="text-lg font-semibold" id="completion-dialog-title">
          {title}
        </h2>
        {description ? (
          <div className="text-sm text-muted-foreground mt-1.5">
            {description}
          </div>
        ) : null}
      </div>
      <div className="flex flex-row gap-2">
        <Button className="flex-1 gap-2" onClick={onCancel} variant="outline">
          <span>{cancelLabel}</span>
          {cancelShortcut ? (
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">
              {cancelShortcut}
            </kbd>
          ) : null}
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={onConfirm}
          ref={confirmButtonRef}
        >
          <span>{confirmLabel}</span>
          {confirmShortcut ? (
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-primary-foreground/20 rounded">
              {confirmShortcut}
            </kbd>
          ) : null}
        </Button>
      </div>
    </div>
  );
}

// eslint-disable-next-line max-lines-per-function -- Modal with keyboard handling
function CompletionDialogImpl({
  cancelLabel,
  cancelShortcut = "S",
  className,
  closeIcon,
  confirmLabel,
  confirmShortcut = "D",
  description,
  isOpen,
  onCancel,
  onClose,
  onConfirm,
  title,
}: CompletionDialogProps): React.ReactNode {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (
        event.key === "Enter" ||
        event.key.toLowerCase() === confirmShortcut.toLowerCase()
      ) {
        event.preventDefault();
        event.stopPropagation();
        onConfirm();
        return;
      }
      if (event.key.toLowerCase() === cancelShortcut.toLowerCase()) {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }
    },
    [isOpen, onClose, onConfirm, onCancel, confirmShortcut, cancelShortcut],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby="completion-dialog-title"
      aria-modal="true"
      className="absolute inset-0 z-[100] flex items-center justify-center"
      role="dialog"
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm",
          "animate-in fade-in-0 duration-200",
        )}
        onClick={onClose}
      />
      <DialogContent
        cancelLabel={cancelLabel}
        cancelShortcut={cancelShortcut}
        className={className}
        closeIcon={closeIcon}
        confirmLabel={confirmLabel}
        confirmShortcut={confirmShortcut}
        description={description}
        onCancel={onCancel}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
      />
    </div>
  );
}

export const CompletionDialog = memo(CompletionDialogImpl);
CompletionDialog.displayName = "CompletionDialog";
