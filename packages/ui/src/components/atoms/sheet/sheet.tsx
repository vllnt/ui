"use client";

import * as React from "react";

import {
  Dialog as SheetRoot,
  DialogBackdrop,
  DialogClose as SheetClosePart,
  DialogContent as SheetContentPart,
  DialogDescription as SheetDescriptionPart,
  type DialogOpenChangeDetails,
  DialogTitle as SheetTitlePart,
  DialogTrigger as SheetTriggerPart,
} from "@ui-sdk/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
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
  /** Radix-compatible: call `preventDefault()` to keep the sheet open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Radix-compatible: call `preventDefault()` to keep the sheet open. */
  onInteractOutside?: (event: PointerDownOutsideEvent) => void;
  /** Radix-compatible: call `preventDefault()` to keep the sheet open. */
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

type SheetRootProps = React.ComponentProps<typeof SheetRoot>;

type SheetProps = Omit<SheetRootProps, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const Sheet = ({ onOpenChange, ...props }: SheetProps) => {
  const dismiss = React.useRef<DismissHandlers>({});
  const handleOpenChange: SheetRootProps["onOpenChange"] = (open, details) => {
    if (!open && dismissPrevented(dismiss.current, details)) {
      details.cancel();
      return;
    }
    onOpenChange?.(open);
  };

  return (
    <DismissContext value={dismiss}>
      <SheetRoot onOpenChange={handleOpenChange} {...props} />
    </DismissContext>
  );
};
Sheet.displayName = "Sheet";

const SheetTrigger = ({
  asChild,
  children,
  ...props
}: RadixPartProps<React.ComponentProps<typeof SheetTriggerPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <SheetTriggerPart
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </SheetTriggerPart>
  );
};
SheetTrigger.displayName = "SheetTrigger";

const SheetClose = ({
  asChild,
  children,
  ...props
}: RadixPartProps<React.ComponentProps<typeof SheetClosePart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <SheetClosePart render={slot.render} {...props}>
      {slot.children}
    </SheetClosePart>
  );
};
SheetClose.displayName = "SheetClose";

/**
 * Kept for compatibility. ui-sdk renders a dialog in place, in the browser top
 * layer, so there is nothing to portal and this renders its children as is.
 * `container` and `forceMount` have no effect here.
 */
const SheetPortal = ({
  children,
}: {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: true;
}): React.ReactNode => children;
SheetPortal.displayName = "SheetPortal";

/**
 * Veil behind the panel. `forceMount` has no effect: ui-sdk keeps the
 * backdrop mounted until its exit animation ends.
 */
const SheetOverlay = ({
  asChild,
  children,
  className,
  forceMount: _forceMount,
  ...props
}: RadixPartProps<React.ComponentProps<typeof DialogBackdrop>> & {
  forceMount?: true;
}) => {
  const slot = asChildProps({ asChild, children });

  return (
    <DialogBackdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      render={withDataAttributes("div", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </DialogBackdrop>
  );
};
SheetOverlay.displayName = "SheetOverlay";

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
  /** Keeps the panel in the page while closed, like Radix's `forceMount`. */
  forceMount?: boolean;
  /** Localizable strings. */
  labels?: SheetLabels;
  /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
  onOpenAutoFocus?: (event: Event) => void;
} & DismissHandlers &
  MaterialProps &
  RadixPartProps<React.ComponentProps<typeof SheetContentPart>> &
  VariantProps<typeof sheetVariants>;

/**
 * Side panel of a {@link Sheet}, rendered in the browser top layer above the
 * page. It sits on the `side` edge of the screen and slides in from there.
 */
const SheetContent = ({
  asChild,
  children,
  className,
  finalFocus,
  forceMount,
  initialFocus,
  labels,
  material = "glass",
  onCloseAutoFocus,
  onEscapeKeyDown,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  ref,
  side = "right",
  ...props
}: SheetContentProps) => {
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
      <SheetOverlay />
      <SheetContentPart
        className={cn(sheetVariants({ side }), className)}
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
        <SheetClosePart className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="size-4" />
          <span className="sr-only">{labels?.close ?? "Close"}</span>
        </SheetClosePart>
        {slot.children}
      </SheetContentPart>
    </>
  );
};
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
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
SheetFooter.displayName = "SheetFooter";

const SheetTitle = ({
  asChild,
  children,
  className,
  ...props
}: RadixPartProps<React.ComponentProps<typeof SheetTitlePart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <SheetTitlePart
      className={cn("text-lg font-semibold text-foreground", className)}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </SheetTitlePart>
  );
};
SheetTitle.displayName = "SheetTitle";

const SheetDescription = ({
  asChild,
  children,
  className,
  ...props
}: RadixPartProps<React.ComponentProps<typeof SheetDescriptionPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <SheetDescriptionPart
      className={cn("text-sm text-muted-foreground", className)}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </SheetDescriptionPart>
  );
};
SheetDescription.displayName = "SheetDescription";

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
