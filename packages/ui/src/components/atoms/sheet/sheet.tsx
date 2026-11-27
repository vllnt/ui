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
import { cva, type VariantProps } from "../../../lib/variants";

type SheetProps = Omit<
  React.ComponentProps<typeof SheetRoot>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const Sheet: ((props: SheetProps) => React.JSX.Element) & {
  displayName: string;
} = /* @__PURE__ */ dialogRoot("Sheet", SheetRoot);
const SheetTrigger = /* @__PURE__ */ dialogTrigger(
  "SheetTrigger",
  SheetTriggerPart,
);
const SheetClose = /* @__PURE__ */ dialogClose("SheetClose", SheetClosePart);
const SheetPortal = /* @__PURE__ */ dialogPortal("SheetPortal");
/**
 * Veil behind the panel. It dims the page; pass `material` to draw a glass or
 * solid scrim instead. `forceMount` has no effect: ui-sdk keeps the backdrop
 * mounted until its exit animation ends.
 */
const OVERLAY_LOOK: OverlayLook = {
  veil: "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
};
const SheetOverlay = /* @__PURE__ */ dialogOverlay(
  "SheetOverlay",
  DialogBackdrop,
  OVERLAY_LOOK,
);
const SheetHeader = /* @__PURE__ */ dialogBox(
  "SheetHeader",
  "flex flex-col space-y-2 text-center sm:text-left",
);
const SheetFooter = /* @__PURE__ */ dialogBox(
  "SheetFooter",
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
);
const SheetTitle = /* @__PURE__ */ dialogTitle(
  "SheetTitle",
  SheetTitlePart,
  "text-lg font-semibold text-foreground",
);
const SheetDescription = /* @__PURE__ */ dialogDescription(
  "SheetDescription",
  SheetDescriptionPart,
  "text-sm text-muted-foreground",
);

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
const SheetContent = /* @__PURE__ */ named(
  "SheetContent",
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
  },
);

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
