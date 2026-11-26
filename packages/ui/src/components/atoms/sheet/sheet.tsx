"use client";

import * as React from "react";

import {
  Dialog as SheetRoot,
  DialogBackdrop,
  DialogClose as SheetClosePart,
  DialogContent as SheetContentPart,
  DialogDescription as SheetDescriptionPart,
  DialogTitle as SheetTitlePart,
  DialogTrigger as SheetTriggerPart,
} from "@ui-sdk/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import type { MaterialProps } from "../../../lib/material";
import type { NarrowPartProps } from "../../../lib/ui-sdk";
import {
  createDialogParts,
  type DialogContentOptions,
  useDialogPopup,
} from "../../../lib/ui-sdk-dialog";
import type { DismissHandlers } from "../../../lib/ui-sdk-dismiss";
import { cn } from "../../../lib/utils";

const parts = createDialogParts(
  "Sheet",
  {
    Backdrop: DialogBackdrop,
    Close: SheetClosePart,
    Description: SheetDescriptionPart,
    Root: SheetRoot,
    Title: SheetTitlePart,
    Trigger: SheetTriggerPart,
  },
  {
    description: "text-sm text-muted-foreground",
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
    header: "flex flex-col space-y-2 text-center sm:text-left",
    title: "text-lg font-semibold text-foreground",
    veil: "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  },
);

type SheetProps = Omit<
  React.ComponentProps<typeof SheetRoot>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const Sheet: ((props: SheetProps) => React.JSX.Element) & {
  displayName: string;
} = parts.Root;
const SheetTrigger = parts.Trigger;
const SheetClose = parts.Close;
const SheetPortal = parts.Portal;
/**
 * Veil behind the panel. It dims the page; pass `material` to draw a glass or
 * solid scrim instead. `forceMount` has no effect: ui-sdk keeps the backdrop
 * mounted until its exit animation ends.
 */
const SheetOverlay = parts.Overlay;
const SheetHeader = parts.Header;
const SheetFooter = parts.Footer;
const SheetTitle = parts.Title;
const SheetDescription = parts.Description;

const sheetVariants = cva(
  "vllnt-glass-floating vllnt-glass-dense fixed z-50 gap-4 p-6 transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    defaultVariants: {
      side: "right",
    },
    variants: {
      side: {
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      },
    },
  },
);

/**
 * Localizable strings for a {@link SheetContent}.
 *
 * @public
 */
export type SheetLabels = {
  /** Accessible name of the close button. Defaults to `"Close"`. */
  close?: string;
};

export type SheetContentProps = {
  /**
   * Draws the close button in the corner. Pass `false` when the content has
   * its own, like a `SheetClose` in a header. Defaults to `true`.
   */
  closeButton?: boolean;
  /** Localizable strings. */
  labels?: SheetLabels;
} & DialogContentOptions &
  DismissHandlers &
  MaterialProps &
  NarrowPartProps<React.ComponentProps<typeof SheetContentPart>> &
  VariantProps<typeof sheetVariants>;

/**
 * Side panel of a {@link Sheet}, rendered in the browser top layer above the
 * page. It sits on the `side` edge of the screen and slides in from there.
 */
const SheetContent = ({
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
  side = "right",
  ...props
}: SheetContentProps) => {
  const {
    closeFocus,
    keepMounted,
    openFocus,
    panelChildren,
    panelReference,
    render,
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
      {overlay === "scrim" ? <SheetOverlay /> : null}
      <SheetContentPart
        className={cn(sheetVariants({ side }), className)}
        data-material={material}
        finalFocus={finalFocus ?? closeFocus}
        initialFocus={initialFocus ?? openFocus}
        keepMounted={keepMounted}
        ref={panelReference}
        render={render}
        {...props}
      >
        {panelChildren}
        {/* Last in the DOM, so the first tabbable element of the content, not
            Close, takes the initial focus. Its position stays `absolute`, so
            Close still sits in the corner. */}
        {closeButton ? (
          <SheetClosePart className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="size-4" />
            <span className="sr-only">{labels?.close ?? "Close"}</span>
          </SheetClosePart>
        ) : null}
      </SheetContentPart>
    </>
  );
};
SheetContent.displayName = "SheetContent";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
