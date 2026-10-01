"use client";

import { memo, useRef } from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { KeyboardEvent, ReactNode } from "react";

import type { HeadingTag } from "../../../lib/types";
import { useReturnFocus } from "../../../lib/use-return-focus";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";

export type CompletionDialogProps = {
  /** Heading tag for the dialog title. Defaults to `h2`. */
  as?: HeadingTag;
  cancelLabel?: string;
  /**
   * Single-key shortcut for cancel while focus is inside the dialog. Pass an
   * empty string to turn it off (WCAG 2.1.4). Defaults to `"S"`.
   */
  cancelShortcut?: string;
  className?: string;
  closeIcon?: ReactNode;
  confirmLabel?: string;
  /**
   * Single-key shortcut for confirm while focus is inside the dialog. Pass an
   * empty string to turn it off (WCAG 2.1.4). Defaults to `"D"`.
   */
  confirmShortcut?: string;
  description?: ReactNode;
  isOpen: boolean;
  /**
   * Page-modal dialog (focus trap, scroll lock, the rest of the page inert).
   * Defaults to `true`. Pass `false` to keep the page interactive; the
   * dialog then overlays its container without trapping focus.
   */
  modal?: boolean;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

type DialogBodyProps = Omit<
  CompletionDialogProps,
  "isOpen" | "modal" | "onClose"
>;

type DialogCloseButtonProps = Pick<DialogBodyProps, "closeIcon">;

function DialogCloseButton({
  closeIcon,
}: DialogCloseButtonProps): React.ReactNode {
  return (
    <DialogPrimitive.Close
      aria-label="Close"
      className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {closeIcon ?? (
        <svg
          aria-hidden="true"
          className="size-4"
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
    </DialogPrimitive.Close>
  );
}

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  return (
    shortcut !== "" &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    event.key.toLowerCase() === shortcut.toLowerCase()
  );
}

type DialogActionsProps = Pick<
  DialogBodyProps,
  | "cancelLabel"
  | "cancelShortcut"
  | "confirmLabel"
  | "confirmShortcut"
  | "onCancel"
  | "onConfirm"
> & { confirmButtonRef: React.Ref<HTMLButtonElement> };

function DialogActions({
  cancelLabel,
  cancelShortcut,
  confirmButtonRef,
  confirmLabel,
  confirmShortcut,
  onCancel,
  onConfirm,
}: DialogActionsProps): React.ReactNode {
  return (
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
  );
}

function DialogBody({
  as: Heading = "h2",
  cancelLabel = "Skip",
  cancelShortcut = "S",
  className,
  closeIcon,
  confirmLabel = "Done",
  confirmShortcut = "D",
  description,
  onCancel,
  onConfirm,
  title,
}: DialogBodyProps): React.ReactNode {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const {
    onCloseAutoFocus: handleCloseAutoFocus,
    onOpenAutoFocus: handleOpenAutoFocus,
  } = useReturnFocus((event) => {
    event.preventDefault();
    confirmButtonRef.current?.focus();
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.defaultPrevented) return;
    if (matchesShortcut(event, confirmShortcut)) {
      event.preventDefault();
      onConfirm();
    } else if (matchesShortcut(event, cancelShortcut)) {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <DialogPrimitive.Content
      {...(description ? {} : { "aria-describedby": undefined })}
      className={cn(
        "relative z-10 w-full max-w-md mx-4 p-6 bg-background border border-border rounded-lg shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className,
      )}
      onCloseAutoFocus={handleCloseAutoFocus}
      onKeyDown={handleKeyDown}
      onOpenAutoFocus={handleOpenAutoFocus}
    >
      <DialogCloseButton closeIcon={closeIcon} />
      <div className="mb-4">
        <DialogPrimitive.Title asChild>
          <Heading className="text-lg font-semibold">{title}</Heading>
        </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description asChild>
            <div className="text-sm text-muted-foreground mt-1.5">
              {description}
            </div>
          </DialogPrimitive.Description>
        ) : null}
      </div>
      <DialogActions
        cancelLabel={cancelLabel}
        cancelShortcut={cancelShortcut}
        confirmButtonRef={confirmButtonRef}
        confirmLabel={confirmLabel}
        confirmShortcut={confirmShortcut}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </DialogPrimitive.Content>
  );
}

/**
 * Modal confirmation overlay that covers its positioned container. Built on
 * the Radix dialog primitive (WAI-ARIA APG modal dialog): focus moves to the
 * confirm button, Tab cycles inside the dialog, Escape and the backdrop close
 * it, and focus returns to the element that opened it. The single-key
 * shortcuts act while focus sits inside the dialog and nowhere else.
 */
const BACKDROP_CLASS = cn(
  "absolute inset-0 bg-background/80 backdrop-blur-sm",
  "animate-in fade-in-0 duration-200",
);

function CompletionDialogImpl({
  isOpen,
  modal = true,
  onClose,
  ...props
}: CompletionDialogProps): React.ReactNode {
  return (
    <DialogPrimitive.Root
      modal={modal}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={isOpen}
    >
      {isOpen ? (
        <div className="absolute inset-0 z-[100] flex items-center justify-center">
          {modal ? (
            <DialogPrimitive.Overlay className={BACKDROP_CLASS} />
          ) : (
            <div aria-hidden="true" className={BACKDROP_CLASS} />
          )}
          <DialogBody {...props} />
        </div>
      ) : null}
    </DialogPrimitive.Root>
  );
}

export const CompletionDialog = memo(CompletionDialogImpl);
CompletionDialog.displayName = "CompletionDialog";
