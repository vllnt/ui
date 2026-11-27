"use client";

import * as React from "react";

import {
  AlertDialog as AlertDialogRoot,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent as AlertDialogContentPart,
  AlertDialogDescription as AlertDialogDescriptionPart,
  AlertDialogTitle as AlertDialogTitlePart,
  AlertDialogTrigger as AlertDialogTriggerPart,
} from "@ui-sdk/react/alert-dialog";

import { named } from "../../../lib/named";
import {
  type AsChildProps,
  assignRef,
  type NarrowPartProps,
} from "../../../lib/ui-sdk";
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
import { buttonVariants } from "../../atoms/button/button";

const AlertDialogCloseButton = /* @__PURE__ */ dialogClose(
  "AlertDialogClose",
  AlertDialogClose,
);

/**
 * Where Cancel puts its element. A ref, not state: ui-sdk calls
 * `initialFocus` as the dialog opens, before a state update from Cancel's
 * effect has re-rendered the content, so state would still be empty then.
 */
const CancelContext =
  React.createContext<null | React.RefObject<HTMLElement | null>>(null);

/** A callback ref that stores the node in `target` and still feeds the caller's `ref`. */
function useStoredRef<T extends HTMLElement>(
  target: null | React.RefObject<HTMLElement | null>,
  ref: React.Ref<T> | undefined,
) {
  return React.useCallback(
    (node: null | T) => {
      assignRef(target, node);
      assignRef(ref, node);
    },
    [target, ref],
  );
}

/** Holds the open state. Renders no element. */
const AlertDialog = /* @__PURE__ */ dialogRoot("AlertDialog", AlertDialogRoot);
const AlertDialogTrigger = /* @__PURE__ */ dialogTrigger(
  "AlertDialogTrigger",
  AlertDialogTriggerPart,
);
/**
 * Kept for compatibility. ui-sdk renders a dialog in place, in the browser top
 * layer, so there is nothing to portal and this renders its children as is.
 * `container` and `forceMount` have no effect here.
 */
const AlertDialogPortal = /* @__PURE__ */ dialogPortal("AlertDialogPortal");
/**
 * Veil behind the panel. `forceMount` has no effect: ui-sdk keeps the
 * backdrop mounted until its exit animation ends.
 */
const OVERLAY_LOOK: OverlayLook = {
  veil: "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
};
const AlertDialogOverlay = /* @__PURE__ */ dialogOverlay(
  "AlertDialogOverlay",
  AlertDialogBackdrop,
  OVERLAY_LOOK,
);
const AlertDialogHeader = /* @__PURE__ */ dialogBox(
  "AlertDialogHeader",
  "flex flex-col space-y-2 text-center sm:text-left",
);
const AlertDialogFooter = /* @__PURE__ */ dialogBox(
  "AlertDialogFooter",
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
);
const AlertDialogTitle = /* @__PURE__ */ dialogTitle(
  "AlertDialogTitle",
  AlertDialogTitlePart,
  "text-lg font-semibold",
);
const AlertDialogDescription = /* @__PURE__ */ dialogDescription(
  "AlertDialogDescription",
  AlertDialogDescriptionPart,
  "text-sm text-muted-foreground",
);

export type AlertDialogContentProps = DialogContentOptions &
  NarrowPartProps<React.ComponentProps<typeof AlertDialogContentPart>> &
  Pick<DismissHandlers, "onEscapeKeyDown">;

/**
 * Modal panel with the `alertdialog` role. Focus starts on the Cancel button,
 * and a press outside the panel does nothing.
 */
const AlertDialogContent = /* @__PURE__ */ named(
  "AlertDialogContent",
  ({
    asChild,
    children,
    className,
    finalFocus,
    forceMount,
    initialFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onOpenAutoFocus,
    overlay = "scrim",
    ref,
    ...props
  }: AlertDialogContentProps) => {
    const cancel = React.useRef<HTMLElement | null>(null);
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
      focusTarget: () => cancel.current,
      forceMount,
      names: props,
      onCloseAutoFocus,
      onEscapeKeyDown,
      onOpenAutoFocus,
      ref,
    });

    return (
      <CancelContext value={cancel}>
        {overlay === "scrim" ? <AlertDialogOverlay /> : null}
        <AlertDialogContentPart
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className,
          )}
          finalFocus={finalFocus ?? closeFocus}
          initialFocus={initialFocus ?? openFocus}
          keepMounted={keepMounted}
          ref={panelReference}
          render={render}
          {...props}
        >
          {panelChildren}
        </AlertDialogContentPart>
      </CancelContext>
    );
  },
);

/** Confirms the question and closes the dialog. */
const AlertDialogAction = /* @__PURE__ */ named(
  "AlertDialogAction",
  ({
    className,
    ...props
  }: AsChildProps &
    NarrowPartProps<React.ComponentProps<typeof AlertDialogClose>>) => (
    <AlertDialogCloseButton
      className={cn(buttonVariants(), className)}
      {...props}
    />
  ),
);

/** Dismisses the question and closes the dialog. Focus starts here. */
const AlertDialogCancel = /* @__PURE__ */ named(
  "AlertDialogCancel",
  ({
    className,
    ref,
    ...props
  }: AsChildProps &
    NarrowPartProps<React.ComponentProps<typeof AlertDialogClose>>) => {
    const cancelReference = useStoredRef(React.use(CancelContext), ref);

    return (
      <AlertDialogCloseButton
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-2 sm:mt-0",
          className,
        )}
        ref={cancelReference}
        {...props}
      />
    );
  },
);

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
