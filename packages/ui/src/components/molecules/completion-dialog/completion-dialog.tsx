"use client";

import { memo, useEffect, useId, useRef } from "react";

import type { ReactNode, RefObject } from "react";

import type { MaterialProps } from "../../../lib/material";
import type { HeadingTag } from "../../../lib/types";
import { useBodyScrollLock } from "../../../lib/use-body-scroll-lock";
import { useEscapeKey } from "../../../lib/use-escape-key";
import { useFocusContainment } from "../../../lib/use-focus-containment";
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
} & MaterialProps;

type DialogBodyProps = Omit<CompletionDialogProps, "isOpen" | "material"> & {
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
};

type DialogCloseButtonProps = Pick<DialogBodyProps, "closeIcon" | "onClose">;

function DialogCloseButton({
  closeIcon,
  onClose,
}: DialogCloseButtonProps): React.ReactNode {
  return (
    <button
      aria-label="Close"
      className="absolute right-3 top-3 inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm p-1 opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => {
        onClose();
      }}
      type="button"
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
    </button>
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
  | "confirmButtonRef"
  | "confirmLabel"
  | "confirmShortcut"
  | "onCancel"
  | "onConfirm"
>;

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

type DialogShortcutsOptions = Pick<DialogBodyProps, "onCancel" | "onConfirm"> &
  Required<Pick<DialogBodyProps, "cancelShortcut" | "confirmShortcut">>;

/**
 * Runs the single-key shortcuts for keys pressed inside the dialog; a key
 * pressed elsewhere on the page does nothing. It listens on the document in the
 * bubble phase, after React has run the handlers inside the dialog, so one of
 * them can claim a key with `preventDefault()`.
 */
function useDialogShortcuts(
  dialogRef: RefObject<HTMLElement | null>,
  {
    cancelShortcut,
    confirmShortcut,
    onCancel,
    onConfirm,
  }: DialogShortcutsOptions,
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.defaultPrevented ||
        !(event.target instanceof Node) ||
        !dialogRef.current?.contains(event.target)
      ) {
        return;
      }
      if (matchesShortcut(event, confirmShortcut)) {
        event.preventDefault();
        onConfirm();
      } else if (matchesShortcut(event, cancelShortcut)) {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cancelShortcut, confirmShortcut, dialogRef, onCancel, onConfirm]);
}

type DialogHeadingProps = Pick<
  DialogBodyProps,
  "as" | "description" | "title"
> & {
  descriptionId: string;
  titleId: string;
};

function DialogHeading({
  as: Heading = "h2",
  description,
  descriptionId,
  title,
  titleId,
}: DialogHeadingProps): React.ReactNode {
  return (
    <div className="mb-4">
      <Heading className="text-lg font-semibold" id={titleId}>
        {title}
      </Heading>
      {description ? (
        <div
          className="text-sm text-muted-foreground mt-1.5"
          id={descriptionId}
        >
          {description}
        </div>
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
  confirmButtonRef,
  confirmLabel = "Done",
  confirmShortcut = "D",
  description,
  dialogRef,
  modal,
  onCancel,
  onClose,
  onConfirm,
  title,
}: DialogBodyProps): React.ReactNode {
  const id = useId();
  const descriptionId = `${id}-description`;
  const titleId = `${id}-title`;

  useDialogShortcuts(dialogRef, {
    cancelShortcut,
    confirmShortcut,
    onCancel,
    onConfirm,
  });

  return (
    <div
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal={modal ? true : undefined}
      className={cn(
        "vllnt-glass-floating vllnt-glass-dense relative z-10 w-full max-w-md mx-4 p-6 border rounded-lg",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className,
      )}
      data-state="open"
      id={id}
      ref={dialogRef}
      // react-doctor-disable-next-line react-doctor/prefer-html-dialog -- a native <dialog> renders in the top layer and would cover the viewport, not its positioned container; useDialogBehavior supplies the focus trap, Escape, scroll lock and inert page
      role="dialog"
      tabIndex={-1}
    >
      <DialogCloseButton closeIcon={closeIcon} onClose={onClose} />
      <DialogHeading
        as={as}
        description={description}
        descriptionId={descriptionId}
        title={title}
        titleId={titleId}
      />
      <DialogActions
        cancelLabel={cancelLabel}
        cancelShortcut={cancelShortcut}
        confirmButtonRef={confirmButtonRef}
        confirmLabel={confirmLabel}
        confirmShortcut={confirmShortcut}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </div>
  );
}

/** Every sibling of `branch` and of its ancestors, up to `<body>`. */
function siblingsAround(branch: Element | null): Element[] {
  const parent = branch?.parentElement;
  if (!branch || !parent) return [];

  return [
    ...[...parent.children].filter((child) => child !== branch),
    ...(parent === document.body ? [] : siblingsAround(parent)),
  ];
}

/**
 * Makes the rest of the page inert while `active`: the siblings of the dialog's
 * ancestors, up to `<body>`, take the `inert` attribute and drop it on close.
 * Live regions stay reachable so announcements keep working, and an element
 * that was inert before the dialog opened stays inert.
 */
function useInertPage(
  dialogRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!active || !dialog) return;

    const page = siblingsAround(dialog.parentElement).filter(
      (element) =>
        !element.hasAttribute("inert") && !element.matches("[aria-live]"),
    );
    page.forEach((element) => {
      element.setAttribute("inert", "");
    });

    return () => {
      page.forEach((element) => {
        element.removeAttribute("inert");
      });
    };
  }, [active, dialogRef]);
}

/**
 * Radix's scroll lock set `position: relative` on `<body>`, so a dialog with
 * no positioned ancestor covered the page body. This keeps that, so the
 * dialog covers the same area as before.
 */
function useRelativeBody(active: boolean): void {
  useEffect(() => {
    const { body } = document;
    if (!active || body.style.position === "relative") return;

    const previous = body.style.position;
    body.style.position = "relative";
    return () => {
      body.style.position = previous;
    };
  }, [active]);
}

/**
 * Calls `onDismiss` when a press that began outside the dialog ends outside it
 * too, so a text selection dragged out of the dialog keeps it open. With
 * `onFocusOutside` it also calls `onDismiss` when focus moves outside the
 * dialog. A modal dialog traps focus, so that case is for a non-modal dialog.
 */
function useDismissOutside(
  dialogRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  { enabled, onFocusOutside }: { enabled: boolean; onFocusOutside: boolean },
): void {
  useEffect(() => {
    if (!enabled) return;

    let pressStartedOutside = false;
    const isOutside = (event: Event): boolean =>
      event.target instanceof Node &&
      dialogRef.current?.contains(event.target) === false;
    const handlePointerDown = (event: Event): void => {
      pressStartedOutside = isOutside(event);
    };
    const handleClick = (event: Event): void => {
      const dismiss = pressStartedOutside && isOutside(event);
      pressStartedOutside = false;
      if (dismiss) onDismiss();
    };
    const handleFocusIn = (event: Event): void => {
      if (isOutside(event)) onDismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);
    if (onFocusOutside) document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [dialogRef, enabled, onDismiss, onFocusOutside]);
}

type DialogBehaviorOptions = {
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  modal: boolean;
  onClose: () => void;
};

/**
 * What the WAI-ARIA APG dialog pattern asks of an open dialog. Call order
 * matters: React cleans effects up in the order they run. The page turns inert
 * before focus moves in, and turns interactive again before focus returns to
 * the opener, because an inert element cannot take focus.
 */
function useDialogBehavior({
  confirmButtonRef,
  dialogRef,
  isOpen,
  modal,
  onClose,
}: DialogBehaviorOptions): void {
  useEscapeKey(onClose, {
    capture: true,
    enabled: isOpen,
    preventDefault: true,
    target: "document",
  });
  useDismissOutside(dialogRef, onClose, {
    enabled: isOpen,
    onFocusOutside: !modal,
  });
  useBodyScrollLock(isOpen && modal);
  useRelativeBody(isOpen && modal);
  useInertPage(dialogRef, isOpen && modal);
  // A modal dialog cycles Tab inside and returns focus to the opener on close.
  useFocusContainment(dialogRef, isOpen && modal);

  // Focus moves to the confirm button on open. A non-modal dialog has no
  // containment, so it hands focus back itself, unless the user moved on.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement;
    confirmButtonRef.current?.focus();
    if (modal) return;

    return () => {
      const focused = document.activeElement;
      if (
        opener instanceof HTMLElement &&
        opener.isConnected &&
        (!focused || focused === document.body)
      ) {
        opener.focus();
      }
    };
  }, [confirmButtonRef, isOpen, modal]);
}

const BACKDROP_CLASS = cn(
  "vllnt-glass-scrim absolute inset-0",
  "animate-in fade-in-0 duration-200",
);

/**
 * Modal confirmation overlay that covers its positioned container. Renders in
 * place, built on the kit's own overlay hooks (WAI-ARIA APG modal dialog):
 * focus moves to the confirm button, Tab cycles inside the dialog, Escape and
 * a press on the backdrop close it, and focus returns to the element that
 * opened it. A modal dialog also locks body scroll and makes the rest of the
 * page inert. The single-key shortcuts act while focus sits inside the dialog
 * and nowhere else.
 */
function CompletionDialogImpl({
  isOpen,
  material = "glass",
  modal = true,
  onClose,
  ...props
}: CompletionDialogProps): React.ReactNode {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogBehavior({ confirmButtonRef, dialogRef, isOpen, modal, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center"
      data-material={material}
    >
      {modal ? (
        <div className={BACKDROP_CLASS} data-state="open" />
      ) : (
        <div aria-hidden="true" className={BACKDROP_CLASS} />
      )}
      <DialogBody
        {...props}
        confirmButtonRef={confirmButtonRef}
        dialogRef={dialogRef}
        modal={modal}
        onClose={onClose}
      />
    </div>
  );
}

export const CompletionDialog = memo(CompletionDialogImpl);
CompletionDialog.displayName = "CompletionDialog";
