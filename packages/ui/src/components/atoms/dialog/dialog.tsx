"use client";

import * as React from "react";

import {
  Dialog as DialogRoot,
  DialogBackdrop,
  DialogClose as DialogClosePart,
  DialogContent as DialogContentPart,
  DialogDescription as DialogDescriptionPart,
  type DialogOpenChangeDetails,
  DialogTitle as DialogTitlePart,
  DialogTrigger as DialogTriggerPart,
} from "@ui-sdk/react/dialog";
import { X } from "lucide-react";

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
  /** Radix-compatible: call `preventDefault()` to keep the dialog open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Radix-compatible: call `preventDefault()` to keep the dialog open. */
  onInteractOutside?: (event: PointerDownOutsideEvent) => void;
  /** Radix-compatible: call `preventDefault()` to keep the dialog open. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
};

const contentAttributes =
  (named: boolean) =>
  (state: { open: boolean }): DataAttributes => ({
    ...openState(state),
    ...(named ? { "aria-labelledby": undefined } : {}),
  });

const DismissContext =
  React.createContext<null | React.RefObject<DismissHandlers>>(null);

function dismissPrevented(
  handlers: DismissHandlers,
  details: DialogOpenChangeDetails,
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
      detail: { originalEvent: details.event ?? new MouseEvent("pointerdown") },
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

type DialogRootProps = React.ComponentProps<typeof DialogRoot>;

type DialogProps = Omit<DialogRootProps, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const Dialog = ({ onOpenChange, ...props }: DialogProps) => {
  const dismiss = React.useRef<DismissHandlers>({});
  const handleOpenChange: DialogRootProps["onOpenChange"] = (open, details) => {
    if (!open && dismissPrevented(dismiss.current, details)) {
      details.cancel();
      return;
    }
    onOpenChange?.(open);
  };

  return (
    <DismissContext value={dismiss}>
      <DialogRoot onOpenChange={handleOpenChange} {...props} />
    </DismissContext>
  );
};
Dialog.displayName = "Dialog";

const DialogTrigger = ({
  asChild,
  children,
  ...props
}: RadixPartProps<React.ComponentProps<typeof DialogTriggerPart>>) => {
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
}: RadixPartProps<React.ComponentProps<typeof DialogClosePart>>) => {
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
  RadixPartProps<React.ComponentProps<typeof DialogBackdrop>> & {
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
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  overlay = "scrim",
  ref,
  ...props
}: DismissHandlers &
  MaterialProps &
  RadixPartProps<React.ComponentProps<typeof DialogContentPart>> & {
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
}: RadixPartProps<React.ComponentProps<typeof DialogTitlePart>>) => {
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
}: RadixPartProps<React.ComponentProps<typeof DialogDescriptionPart>>) => {
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
