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
import { named } from "../../../lib/named";
import type { NarrowPartProps } from "../../../lib/ui-sdk";
import {
  dialogBox,
  dialogClose,
  type DialogContentOptions,
  dialogDescription,
  dialogOverlay,
  dialogPortal,
  dialogRoot,
  dialogTitle,
  dialogTrigger,
  type OverlayLook,
  useDialogPopup,
} from "../../../lib/ui-sdk-dialog";
import type { DismissHandlers } from "../../../lib/ui-sdk-dismiss";
import { cn } from "../../../lib/utils";

type DialogProps = Omit<
  React.ComponentProps<typeof DialogRoot>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const Dialog: ((props: DialogProps) => React.JSX.Element) & {
  displayName: string;
} = /* @__PURE__ */ dialogRoot("Dialog", DialogRoot);
const DialogTrigger = /* @__PURE__ */ dialogTrigger(
  "DialogTrigger",
  DialogTriggerPart,
);
const DialogPortal = /* @__PURE__ */ dialogPortal("DialogPortal");
const DialogClose = /* @__PURE__ */ dialogClose("DialogClose", DialogClosePart);
/**
 * Veil behind the panel. `forceMount` has no effect: ui-sdk keeps the
 * backdrop mounted until its exit animation ends.
 */
const OVERLAY_LOOK: OverlayLook = {
  material: "glass",
  veil: "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
};
const DialogOverlay = /* @__PURE__ */ dialogOverlay(
  "DialogOverlay",
  DialogBackdrop,
  OVERLAY_LOOK,
);
const DialogHeader = /* @__PURE__ */ dialogBox(
  "DialogHeader",
  "flex flex-col space-y-1.5 text-center sm:text-left",
);
const DialogFooter = /* @__PURE__ */ dialogBox(
  "DialogFooter",
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
);
const DialogTitle = /* @__PURE__ */ dialogTitle(
  "DialogTitle",
  DialogTitlePart,
  "text-lg font-semibold leading-none tracking-tight",
);
const DialogDescription = /* @__PURE__ */ dialogDescription(
  "DialogDescription",
  DialogDescriptionPart,
  "text-sm text-muted-foreground",
);

/**
 * Localizable strings for a {@link DialogContent}.
 *
 * @public
 */
export type DialogLabels = {
  /** Accessible name of the close button. Defaults to `"Close"`. */
  close?: string;
};

export type DialogContentProps = DialogContentOptions &
  DismissHandlers &
  MaterialProps &
  NarrowPartProps<React.ComponentProps<typeof DialogContentPart>> & {
    /**
     * Draws the close button in the corner. Pass `false` when the content has
     * its own, like a `DialogClose` in a header. Defaults to `true`.
     */
    closeButton?: boolean;
    /** Localizable strings. */
    labels?: DialogLabels;
  };

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
const DialogContent = /* @__PURE__ */ named(
  "DialogContent",
  ({
    asChild,
    children,
    className,
    closeButton = true,
    finalFocus,
    forceMount,
    initialFocus,
    labels,
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
  }: DialogContentProps) => {
    const {
      closeFocus,
      keepMounted,
      openFocus,
      panelChildren,
      panelReference,
      render,
      replaced,
    } = useDialogPopup({
      asChild,
      children,
      forceMount,
      names: props,
      onCloseAutoFocus,
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onOpenAutoFocus,
      onPointerDownOutside,
      ref,
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
          finalFocus={finalFocus ?? closeFocus}
          initialFocus={initialFocus ?? openFocus}
          keepMounted={keepMounted}
          ref={panelReference}
          render={render}
          {...props}
        >
          {panelChildren}
          {replaced || !closeButton ? null : (
            <DialogClosePart className="absolute right-3 top-3 inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-4" />
              <span className="sr-only">{labels?.close ?? "Close"}</span>
            </DialogClosePart>
          )}
        </DialogContentPart>
      </>
    );
  },
);

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
