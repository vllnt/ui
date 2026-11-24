"use client";

import { memo, useRef } from "react";

import {
  Dialog as DialogRoot,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import type { KeyboardEvent, ReactNode } from "react";

import type { MaterialProps } from "../../../lib/material";
import type { HeadingTag } from "../../../lib/types";
import { openState, withDataAttributes } from "../../../lib/ui-sdk";
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
   * dialog then dims the viewport without trapping focus.
   */
  modal?: boolean;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
} & MaterialProps;

type DialogBodyProps = Omit<
  CompletionDialogProps,
  "isOpen" | "modal" | "onClose"
>;

type DialogCloseButtonProps = Pick<DialogBodyProps, "closeIcon">;

function DialogCloseButton({
  closeIcon,
}: DialogCloseButtonProps): React.ReactNode {
  return (
    <DialogClose
      aria-label="Close"
      className="absolute right-3 top-3 inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm p-1 opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
    </DialogClose>
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

type DialogHeadingProps = Pick<DialogBodyProps, "as" | "description" | "title">;

function DialogHeading({
  as: Heading = "h2",
  description,
  title,
}: DialogHeadingProps): React.ReactNode {
  return (
    <div className="mb-4">
      <DialogTitle
        render={<Heading className="text-lg font-semibold">{title}</Heading>}
      />
      {description ? (
        <DialogDescription
          render={
            <div className="text-sm text-muted-foreground mt-1.5">
              {description}
            </div>
          }
        />
      ) : null}
    </div>
  );
}

function DialogBody({
  as,
  cancelLabel = "Skip",
  cancelShortcut = "S",
  className,
  closeIcon,
  confirmLabel = "Done",
  confirmShortcut = "D",
  description,
  material,
  onCancel,
  onConfirm,
  title,
}: DialogBodyProps): React.ReactNode {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

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
    <DialogContent
      className={cn(
        "vllnt-glass-floating vllnt-glass-dense fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-md p-6 border rounded-lg",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className,
      )}
      data-material={material}
      initialFocus={() => confirmButtonRef.current ?? undefined}
      onKeyDown={handleKeyDown}
      render={withDataAttributes("div", openState)}
    >
      <DialogCloseButton closeIcon={closeIcon} />
      <DialogHeading as={as} description={description} title={title} />
      <DialogActions
        cancelLabel={cancelLabel}
        cancelShortcut={cancelShortcut}
        confirmButtonRef={confirmButtonRef}
        confirmLabel={confirmLabel}
        confirmShortcut={confirmShortcut}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </DialogContent>
  );
}

/**
 * Modal confirmation overlay. Built on the ui-sdk dialog (WAI-ARIA APG modal
 * dialog): focus moves to the confirm button, Tab cycles inside the dialog,
 * Escape and the backdrop close it, and focus returns to the element that
 * opened it. The single-key shortcuts act while focus sits inside the dialog
 * and nowhere else. The panel and its backdrop render in the browser top
 * layer, so they cover the viewport rather than a positioned container.
 */
const BACKDROP_CLASS = cn(
  "vllnt-glass-scrim fixed inset-0 m-0 size-full",
  "animate-in fade-in-0 duration-200",
);

function CompletionDialogImpl({
  isOpen,
  material = "glass",
  modal = true,
  onClose,
  ...props
}: CompletionDialogProps): React.ReactNode {
  return (
    <DialogRoot
      closeOnOutsidePress
      modal={modal}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={isOpen}
    >
      {isOpen && modal ? (
        <DialogBackdrop
          className={BACKDROP_CLASS}
          data-material={material}
          render={withDataAttributes("div", openState)}
        />
      ) : null}
      {isOpen && !modal ? (
        <div
          aria-hidden="true"
          className={cn(BACKDROP_CLASS, "z-[100]")}
          data-material={material}
        />
      ) : null}
      <DialogBody {...props} material={material} />
    </DialogRoot>
  );
}

export const CompletionDialog = memo(CompletionDialogImpl);
CompletionDialog.displayName = "CompletionDialog";
