"use client";

import * as React from "react";

import {
  Drawer as DrawerRoot,
  DrawerBackdrop,
  DrawerClose as DrawerClosePart,
  DrawerContent as DrawerContentPart,
  DrawerDescription as DrawerDescriptionPart,
  type DrawerSide,
  DrawerTitle as DrawerTitlePart,
  DrawerTrigger as DrawerTriggerPart,
  type SnapPoint,
} from "@ui-sdk/react/drawer";

import type { MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import type { DataAttributes, NarrowPartProps } from "../../../lib/ui-sdk";
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

const AutoFocusContext = React.createContext(true);

const DrawerPart = /* @__PURE__ */ dialogRoot("Drawer", DrawerRoot);

/** Tuning props of the previous drawer library. Each one has no effect. */
type VaulOnlyProps = {
  closeThreshold?: number;
  disablePreventScroll?: boolean;
  fadeFromIndex?: number;
  fixed?: boolean;
  handleOnly?: boolean;
  nested?: boolean;
  noBodyStyles?: boolean;
  onDrag?: (
    event: React.PointerEvent<HTMLDivElement>,
    percentageDragged: number,
  ) => void;
  onRelease?: (
    event: React.PointerEvent<HTMLDivElement>,
    open: boolean,
  ) => void;
  preventScrollRestoration?: boolean;
  repositionInputs?: boolean;
  scrollLockTimeout?: number;
  setBackgroundColorOnScale?: boolean;
  shouldScaleBackground?: boolean;
};

function withoutVaulOnly<Props extends VaulOnlyProps>({
  closeThreshold: _closeThreshold,
  disablePreventScroll: _disablePreventScroll,
  fadeFromIndex: _fadeFromIndex,
  fixed: _fixed,
  handleOnly: _handleOnly,
  nested: _nested,
  noBodyStyles: _noBodyStyles,
  onDrag: _onDrag,
  onRelease: _onRelease,
  preventScrollRestoration: _preventScrollRestoration,
  repositionInputs: _repositionInputs,
  scrollLockTimeout: _scrollLockTimeout,
  setBackgroundColorOnScale: _setBackgroundColorOnScale,
  shouldScaleBackground: _shouldScaleBackground,
  ...props
}: Props) {
  return props;
}

type DrawerRootProps = React.ComponentProps<typeof DrawerRoot>;

type DrawerProps = Omit<DrawerRootProps, "onOpenChange"> &
  VaulOnlyProps & {
    /** Snap point the drawer rests on. Same as `snapPoint`. */
    activeSnapPoint?: null | SnapPoint;
    /**
     * Moves focus into the drawer when it opens (WAI-ARIA APG modal dialog).
     * Pass `false` to leave focus on the trigger. Defaults to `true`.
     */
    autoFocus?: boolean;
    /** Edge the drawer comes from. Same as `side`. */
    direction?: DrawerSide;
    /** Runs when the open animation or the close animation ends. */
    onAnimationEnd?: (open: boolean) => void;
    /** Runs after the drawer closes. */
    onClose?: () => void;
    /** Runs with the new open state. `onClose` runs too on a close. */
    onOpenChange?: (open: boolean) => void;
    /** Runs when the drawer moves to another snap point. */
    setActiveSnapPoint?: (snapPoint: null | SnapPoint) => void;
  };

/**
 * Sheet that slides in from an edge, built on the ui-sdk drawer. Focus moves
 * into the content when it opens (WAI-ARIA APG modal dialog); pass
 * `autoFocus={false}` to leave focus on the trigger. Props of the previous
 * library that have no ui-sdk counterpart, like `shouldScaleBackground`, are
 * accepted and ignored.
 */
const Drawer = /* @__PURE__ */ named(
  "Drawer",
  ({
    activeSnapPoint,
    autoFocus = true,
    direction,
    onAnimationEnd,
    onClose,
    onOpenChange,
    onOpenChangeComplete,
    onSnapPointChange,
    setActiveSnapPoint,
    side,
    snapPoint,
    ...props
  }: DrawerProps) => (
    <AutoFocusContext value={autoFocus}>
      <DrawerPart
        {...withoutVaulOnly(props)}
        onOpenChange={(open) => {
          onOpenChange?.(open);
          if (!open) {
            onClose?.();
          }
        }}
        onOpenChangeComplete={onOpenChangeComplete ?? onAnimationEnd}
        onSnapPointChange={
          onSnapPointChange ??
          (setActiveSnapPoint &&
            ((point) => {
              setActiveSnapPoint(point);
            }))
        }
        side={side ?? direction}
        snapPoint={snapPoint ?? activeSnapPoint}
      />
    </AutoFocusContext>
  ),
);

const DrawerTrigger = /* @__PURE__ */ dialogTrigger(
  "DrawerTrigger",
  DrawerTriggerPart,
);
/**
 * Kept for compatibility. ui-sdk renders a drawer in the browser top layer, so
 * there is nothing to portal and this renders its children as is. `container`
 * and `forceMount` have no effect here.
 */
const DrawerPortal = /* @__PURE__ */ dialogPortal("DrawerPortal");
const DrawerClose = /* @__PURE__ */ dialogClose("DrawerClose", DrawerClosePart);
/**
 * Veil behind the sheet. `forceMount` has no effect: ui-sdk keeps the
 * backdrop mounted until its exit animation ends.
 */
const OVERLAY_LOOK: OverlayLook = {
  veil: "fixed inset-0 z-50 m-0 size-full",
  veilAttributes: { "data-vaul-overlay": "" },
};
const DrawerOverlay = /* @__PURE__ */ dialogOverlay(
  "DrawerOverlay",
  DrawerBackdrop,
  OVERLAY_LOOK,
);
const DrawerHeader = /* @__PURE__ */ dialogBox(
  "DrawerHeader",
  "grid gap-1.5 p-4 text-center sm:text-left",
);
const DrawerFooter = /* @__PURE__ */ dialogBox(
  "DrawerFooter",
  "mt-auto flex flex-col gap-2 p-4",
);
const DrawerTitle = /* @__PURE__ */ dialogTitle(
  "DrawerTitle",
  DrawerTitlePart,
  "text-lg font-semibold leading-none tracking-tight",
);
const DrawerDescription = /* @__PURE__ */ dialogDescription(
  "DrawerDescription",
  DrawerDescriptionPart,
  "text-sm text-muted-foreground",
);

export type DrawerContentProps = DialogContentOptions &
  DismissHandlers &
  MaterialProps &
  NarrowPartProps<React.ComponentProps<typeof DrawerContentPart>>;

const drawerAttributes = (state: {
  open: boolean;
  side: string;
}): DataAttributes => ({
  "data-vaul-drawer": "",
  "data-vaul-drawer-direction": state.side,
});

/**
 * Sheet panel of a {@link Drawer}, rendered in the browser top layer with its
 * veil and a handle bar. The drawer positions the panel at its edge, so the
 * panel needs no positioning classes. With `asChild`, the single child element
 * renders as the panel.
 */
const DrawerContent = /* @__PURE__ */ named(
  "DrawerContent",
  ({
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
  }: DrawerContentProps) => {
    const autoFocus = React.use(AutoFocusContext);
    const {
      closeFocus,
      keepMounted,
      openFocus,
      panelChildren,
      panelReference,
      render,
    } = useDialogPopup({
      asChild,
      attributes: drawerAttributes,
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
        {overlay === "scrim" ? <DrawerOverlay /> : null}
        <DrawerContentPart
          className={cn(
            "vllnt-glass-floating vllnt-glass-dense mt-24 flex h-auto flex-col rounded-t-[10px] border",
            // vaul's backfill: the panel's background runs on past the edge it
            // comes from, so a drag past the edge shows no gap, and it covers
            // the border on that edge.
            "after:absolute after:content-[''] after:[background:inherit]",
            "data-[vaul-drawer-direction=bottom]:after:inset-x-0 data-[vaul-drawer-direction=bottom]:after:top-full data-[vaul-drawer-direction=bottom]:after:h-[200%]",
            "data-[vaul-drawer-direction=top]:after:inset-x-0 data-[vaul-drawer-direction=top]:after:bottom-full data-[vaul-drawer-direction=top]:after:h-[200%]",
            "data-[vaul-drawer-direction=left]:after:inset-y-0 data-[vaul-drawer-direction=left]:after:right-full data-[vaul-drawer-direction=left]:after:w-[200%]",
            "data-[vaul-drawer-direction=right]:after:inset-y-0 data-[vaul-drawer-direction=right]:after:left-full data-[vaul-drawer-direction=right]:after:w-[200%]",
            className,
          )}
          data-material={material}
          finalFocus={finalFocus ?? closeFocus}
          initialFocus={initialFocus ?? (autoFocus ? openFocus : "none")}
          keepMounted={keepMounted}
          ref={panelReference}
          render={render}
          {...props}
        >
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-secondary" />
          {panelChildren}
        </DrawerContentPart>
      </>
    );
  },
);

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
