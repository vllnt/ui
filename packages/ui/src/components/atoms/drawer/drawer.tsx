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
import {
  asChildProps,
  closeAutoFocus,
  type DataAttributes,
  openAutoFocus,
  openState,
  useElementRef,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: MouseEvent }>;

type DismissHandlers = {
  /** Radix-compatible: call `preventDefault()` to keep the drawer open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Radix-compatible: call `preventDefault()` to keep the drawer open. */
  onInteractOutside?: (event: PointerDownOutsideEvent) => void;
  /** Radix-compatible: call `preventDefault()` to keep the drawer open. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
};

const DismissContext =
  React.createContext<null | React.RefObject<DismissHandlers>>(null);

const AutoFocusContext = React.createContext(true);

function dismissPrevented(
  handlers: DismissHandlers,
  details: { event?: Event; reason: string },
): boolean {
  if (details.reason === "escape-key") {
    const event = new KeyboardEvent("keydown", {
      cancelable: true,
      code: "Escape",
      key: "Escape",
    });
    handlers.onEscapeKeyDown?.(event);
    return event.defaultPrevented;
  }
  if (details.reason === "outside-press") {
    const event = new CustomEvent("dismissable-layer.pointerDownOutside", {
      cancelable: true,
      detail: {
        originalEvent:
          details.event instanceof MouseEvent
            ? details.event
            : new MouseEvent("pointerdown"),
      },
    });
    handlers.onPointerDownOutside?.(event);
    handlers.onInteractOutside?.(event);
    return event.defaultPrevented;
  }
  return false;
}

function useRegisterDismissHandlers(handlers: DismissHandlers) {
  const dismissRef = React.use(DismissContext);
  React.useEffect(() => {
    if (dismissRef) {
      dismissRef.current = handlers;
    }
  });
}

type RadixPartProps<Props> = Omit<
  Props,
  "children" | "className" | "render"
> & {
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
};

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
const Drawer = ({
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
}: DrawerProps) => {
  const dismiss = React.useRef<DismissHandlers>({});
  const handleOpenChange: DrawerRootProps["onOpenChange"] = (open, details) => {
    if (!open && dismissPrevented(dismiss.current, details)) {
      details.cancel();
      return;
    }
    onOpenChange?.(open);
    if (!open) {
      onClose?.();
    }
  };

  return (
    <DismissContext value={dismiss}>
      <AutoFocusContext value={autoFocus}>
        <DrawerRoot
          {...withoutVaulOnly(props)}
          onOpenChange={handleOpenChange}
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
    </DismissContext>
  );
};
Drawer.displayName = "Drawer";

const DrawerTrigger = ({
  asChild,
  children,
  ...props
}: RadixPartProps<React.ComponentProps<typeof DrawerTriggerPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DrawerTriggerPart
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </DrawerTriggerPart>
  );
};
DrawerTrigger.displayName = "DrawerTrigger";

/**
 * Kept for compatibility. ui-sdk renders a drawer in the browser top layer, so
 * there is nothing to portal and this renders its children as is. `container`
 * and `forceMount` have no effect here.
 */
const DrawerPortal = ({
  children,
}: {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: true;
}): React.ReactNode => children;
DrawerPortal.displayName = "DrawerPortal";

const DrawerClose = ({
  asChild,
  children,
  ...props
}: RadixPartProps<React.ComponentProps<typeof DrawerClosePart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DrawerClosePart render={slot.render} {...props}>
      {slot.children}
    </DrawerClosePart>
  );
};
DrawerClose.displayName = "DrawerClose";

const overlayAttributes = (state: { open: boolean }): DataAttributes => ({
  ...openState(state),
  "data-vaul-overlay": "",
});

/**
 * Veil behind the sheet. `forceMount` has no effect: ui-sdk keeps the
 * backdrop mounted until its exit animation ends.
 */
const DrawerOverlay = ({
  asChild,
  children,
  className,
  forceMount: _forceMount,
  ...props
}: RadixPartProps<React.ComponentProps<typeof DrawerBackdrop>> & {
  forceMount?: true;
}) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DrawerBackdrop
      className={cn("fixed inset-0 z-50 m-0 size-full bg-black/80", className)}
      render={withDataAttributes("div", overlayAttributes, slot.render)}
      {...props}
    >
      {slot.children}
    </DrawerBackdrop>
  );
};
DrawerOverlay.displayName = "DrawerOverlay";

const contentAttributes =
  (named: boolean) =>
  (state: { open: boolean; side: string }): DataAttributes => ({
    ...openState(state),
    "data-vaul-drawer": "",
    "data-vaul-drawer-direction": state.side,
    ...(named ? { "aria-labelledby": undefined } : {}),
  });

/**
 * Sheet panel of a {@link Drawer}, rendered in the browser top layer with its
 * veil and a handle bar. The drawer positions the panel at its edge, so the
 * panel needs no positioning classes. With `asChild`, the single child element
 * renders as the panel and the handle bar drops out.
 */
const DrawerContent = ({
  asChild,
  children,
  className,
  finalFocus,
  forceMount,
  initialFocus,
  material = "glass",
  onCloseAutoFocus,
  onEscapeKeyDown,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  ref,
  ...props
}: DismissHandlers &
  MaterialProps &
  RadixPartProps<React.ComponentProps<typeof DrawerContentPart>> & {
    /** Keeps the panel in the page while closed, like Radix's `forceMount`. */
    forceMount?: boolean;
    /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
    onCloseAutoFocus?: (event: Event) => void;
    /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
    onOpenAutoFocus?: (event: Event) => void;
  }) => {
  const autoFocus = React.use(AutoFocusContext);
  const [content, contentReference] = useElementRef(ref);
  const slot = asChildProps({ asChild, children });
  const named =
    props["aria-label"] !== undefined && props["aria-labelledby"] === undefined;
  useRegisterDismissHandlers({
    onEscapeKeyDown,
    onInteractOutside,
    onPointerDownOutside,
  });

  return (
    <>
      <DrawerOverlay />
      <DrawerContentPart
        className={cn(
          "vllnt-glass-floating vllnt-glass-dense mt-24 flex h-auto flex-col rounded-t-[10px] border",
          className,
        )}
        data-material={material}
        finalFocus={finalFocus ?? closeAutoFocus(onCloseAutoFocus)}
        initialFocus={
          initialFocus ??
          (autoFocus ? openAutoFocus(() => content, onOpenAutoFocus) : "none")
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
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-secondary" />
        {slot.children}
      </DrawerContentPart>
    </>
  );
};
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = ({
  asChild,
  children,
  className,
  ...props
}: RadixPartProps<React.ComponentProps<typeof DrawerTitlePart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DrawerTitlePart
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </DrawerTitlePart>
  );
};
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = ({
  asChild,
  children,
  className,
  ...props
}: RadixPartProps<React.ComponentProps<typeof DrawerDescriptionPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DrawerDescriptionPart
      className={cn("text-sm text-muted-foreground", className)}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </DrawerDescriptionPart>
  );
};
DrawerDescription.displayName = "DrawerDescription";

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
