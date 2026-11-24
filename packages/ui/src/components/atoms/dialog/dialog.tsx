"use client";

import * as React from "react";

import {
  Dialog as DialogRoot,
  DialogBackdrop,
  DialogClose as DialogClosePart,
  DialogContent as DialogContentPart,
  DialogDescription as DialogDescriptionPart,
  DialogTitle as DialogTitlePart,
  DialogTrigger as DialogTriggerPart,
} from "@ui-sdk/react/dialog";
import { X } from "lucide-react";

import type { MaterialProps } from "../../../lib/material";
import {
  type AsChildProps,
  asChildProps,
  closeAutoFocus,
  type DataAttributes,
  type NarrowPartProps,
  openAutoFocus,
  openState,
  useElementRef,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import {
  DismissContext,
  type DismissHandlers,
  useDismissRoot,
  useRegisterDismissHandlers,
} from "../../../lib/ui-sdk-dismiss";
import { cn } from "../../../lib/utils";

const contentAttributes =
  (named: boolean) =>
  (state: { open: boolean }): DataAttributes => ({
    ...openState(state),
    ...(named ? { "aria-labelledby": undefined } : {}),
  });

type DialogRootProps = React.ComponentProps<typeof DialogRoot>;

type DialogProps = Omit<DialogRootProps, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const Dialog = ({ onOpenChange, ...props }: DialogProps) => {
  const dismiss = useDismissRoot((open) => {
    onOpenChange?.(open);
  });

  return (
    <DismissContext value={dismiss.ref}>
      <DialogRoot onOpenChange={dismiss.handleOpenChange} {...props} />
    </DismissContext>
  );
};
Dialog.displayName = "Dialog";

const DialogTrigger = ({
  asChild,
  children,
  ...props
}: AsChildProps &
  NarrowPartProps<React.ComponentProps<typeof DialogTriggerPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DialogTriggerPart
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </DialogTriggerPart>
  );
};
DialogTrigger.displayName = "DialogTrigger";

/**
 * Kept for compatibility. ui-sdk renders a dialog in place, in the browser top
 * layer, so there is nothing to portal and this renders its children as is.
 * `container` and `forceMount` have no effect here.
 */
const DialogPortal = ({
  children,
}: {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: true;
}): React.ReactNode => children;
DialogPortal.displayName = "DialogPortal";

const DialogClose = ({
  asChild,
  children,
  ...props
}: AsChildProps &
  NarrowPartProps<React.ComponentProps<typeof DialogClosePart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DialogClosePart render={slot.render} {...props}>
      {slot.children}
    </DialogClosePart>
  );
};
DialogClose.displayName = "DialogClose";

/**
 * Veil behind the panel. `forceMount` has no effect: ui-sdk keeps the
 * backdrop mounted until its exit animation ends.
 */
const DialogOverlay = ({
  asChild,
  children,
  className,
  forceMount: _forceMount,
  material = "glass",
  ...props
}: MaterialProps &
  AsChildProps &
  NarrowPartProps<React.ComponentProps<typeof DialogBackdrop>> & {
    forceMount?: true;
  }) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DialogBackdrop
      className={cn(
        "vllnt-glass-scrim fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      data-material={material}
      render={withDataAttributes("div", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </DialogBackdrop>
  );
};
DialogOverlay.displayName = "DialogOverlay";

const DialogCornerClose = () => (
  <DialogClosePart className="absolute right-3 top-3 inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
    <X className="size-4" />
    <span className="sr-only">Close</span>
  </DialogClosePart>
);

/**
 * Modal panel of a {@link Dialog}, rendered in the browser top layer above the
 * page. With `asChild`, the single child element renders as the panel and the
 * built-in close button drops out.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent overlay="none">...</DialogContent>
 * </Dialog>
 * ```
 */
const DialogContent = ({
  asChild,
  children,
  className,
  finalFocus,
  forceMount,
  initialFocus,
  material = "glass",
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  overlay = "scrim",
  ref,
  ...props
}: DismissHandlers &
  MaterialProps &
  AsChildProps &
  NarrowPartProps<React.ComponentProps<typeof DialogContentPart>> & {
    /** Keeps the panel in the page while closed, like Radix's `forceMount`. */
    forceMount?: boolean;
    /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
    onCloseAutoFocus?: (event: Event) => void;
    /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
    onOpenAutoFocus?: (event: Event) => void;
    /**
     * Veil drawn behind the panel. `"scrim"` (default) dims and blurs the page;
     * `"none"` draws nothing, so the page stays fully visible behind the dialog.
     * The dialog stays modal either way: it traps focus, locks page scroll and
     * hides the page from assistive technology.
     */
    overlay?: "none" | "scrim";
  }) => {
  const [content, contentReference] = useElementRef(ref);
  const slot = asChildProps({ asChild, children });
  const named =
    props["aria-label"] !== undefined && props["aria-labelledby"] === undefined;
  useRegisterDismissHandlers({
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
  });

  return (
    <>
      {overlay === "scrim" ? <DialogOverlay material={material} /> : null}
      <DialogContentPart
        className={cn(
          "fixed left-[50%] top-[50%] z-50 vllnt-glass-floating vllnt-glass-dense grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        data-material={material}
        finalFocus={finalFocus ?? closeAutoFocus(onCloseAutoFocus)}
        initialFocus={
          initialFocus ?? openAutoFocus(() => content, onOpenAutoFocus)
        }
        keepMounted={forceMount}
        ref={contentReference}
        render={withDataAttributes(
          "div",
          contentAttributes(named),
          slot.render,
        )}
        {...props}
      >
        {slot.children}
        {slot.render ? null : <DialogCornerClose />}
      </DialogContentPart>
    </>
  );
};
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = ({
  asChild,
  children,
  className,
  ...props
}: AsChildProps &
  NarrowPartProps<React.ComponentProps<typeof DialogTitlePart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DialogTitlePart
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </DialogTitlePart>
  );
};
DialogTitle.displayName = "DialogTitle";

const DialogDescription = ({
  asChild,
  children,
  className,
  ...props
}: AsChildProps &
  NarrowPartProps<React.ComponentProps<typeof DialogDescriptionPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DialogDescriptionPart
      className={cn("text-sm text-muted-foreground", className)}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </DialogDescriptionPart>
  );
};
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
