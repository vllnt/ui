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
import { buttonVariants } from "../../atoms/button/button";

type EscapeHandler = ((event: KeyboardEvent) => void) | undefined;

const EscapeContext =
  React.createContext<null | React.RefObject<EscapeHandler>>(null);

const CancelContext = React.createContext<
  ((element: HTMLElement | null) => void) | null
>(null);

const contentAttributes =
  (named: boolean) =>
  (state: { open: boolean }): DataAttributes => ({
    ...openState(state),
    ...(named ? { "aria-labelledby": undefined } : {}),
  });

type RadixPartProps<Props> = Omit<
  Props,
  "children" | "className" | "render"
> & {
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
};

type AlertDialogRootProps = React.ComponentProps<typeof AlertDialogRoot>;

type AlertDialogProps = Omit<AlertDialogRootProps, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

/** Holds the open state. Renders no element. */
const AlertDialog = ({ onOpenChange, ...props }: AlertDialogProps) => {
  const escapeRef = React.useRef<EscapeHandler>(undefined);
  const handleOpenChange: AlertDialogRootProps["onOpenChange"] = (
    open,
    details,
  ) => {
    if (!open && details.reason === "escape-key") {
      const event = new KeyboardEvent("keydown", {
        cancelable: true,
        code: "Escape",
        key: "Escape",
      });
      escapeRef.current?.(event);
      if (event.defaultPrevented) {
        details.cancel();
        return;
      }
    }
    onOpenChange?.(open);
  };

  return (
    <EscapeContext value={escapeRef}>
      <AlertDialogRoot onOpenChange={handleOpenChange} {...props} />
    </EscapeContext>
  );
};
AlertDialog.displayName = "AlertDialog";

const AlertDialogTrigger = ({
  asChild,
  children,
  ...props
}: RadixPartProps<React.ComponentProps<typeof AlertDialogTriggerPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <AlertDialogTriggerPart
      render={withDataAttributes("button", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </AlertDialogTriggerPart>
  );
};
AlertDialogTrigger.displayName = "AlertDialogTrigger";

/**
 * Kept for compatibility. ui-sdk renders a dialog in place, in the browser top
 * layer, so there is nothing to portal and this renders its children as is.
 * `container` and `forceMount` have no effect here.
 */
const AlertDialogPortal = ({
  children,
}: {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: true;
}): React.ReactNode => children;
AlertDialogPortal.displayName = "AlertDialogPortal";

/**
 * Veil behind the panel. `forceMount` has no effect: ui-sdk keeps the
 * backdrop mounted until its exit animation ends.
 */
const AlertDialogOverlay = ({
  asChild,
  children,
  className,
  forceMount: _forceMount,
  ...props
}: RadixPartProps<React.ComponentProps<typeof AlertDialogBackdrop>> & {
  forceMount?: true;
}) => {
  const slot = asChildProps({ asChild, children });

  return (
    <AlertDialogBackdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      render={withDataAttributes("div", openState, slot.render)}
      {...props}
    >
      {slot.children}
    </AlertDialogBackdrop>
  );
};
AlertDialogOverlay.displayName = "AlertDialogOverlay";

/**
 * Modal panel with the `alertdialog` role. Focus starts on the Cancel button,
 * and a press outside the panel does nothing.
 */
const AlertDialogContent = ({
  asChild,
  children,
  className,
  finalFocus,
  forceMount,
  initialFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onOpenAutoFocus,
  ref,
  ...props
}: RadixPartProps<React.ComponentProps<typeof AlertDialogContentPart>> & {
  /** Keeps the panel in the page while closed, like Radix's `forceMount`. */
  forceMount?: boolean;
  /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Radix-compatible: call `preventDefault()` to keep the dialog open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Radix-compatible: call `preventDefault()` to leave focus where your handler put it. */
  onOpenAutoFocus?: (event: Event) => void;
}) => {
  const escapeRef = React.use(EscapeContext);
  const [cancel, setCancel] = React.useState<HTMLElement | null>(null);
  const [content, contentReference] = useElementRef(ref);
  const slot = asChildProps({ asChild, children });
  const named =
    props["aria-label"] !== undefined && props["aria-labelledby"] === undefined;

  React.useEffect(() => {
    if (escapeRef) {
      escapeRef.current = onEscapeKeyDown;
    }
  });

  return (
    <CancelContext value={setCancel}>
      <AlertDialogOverlay />
      <AlertDialogContentPart
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        finalFocus={finalFocus ?? closeAutoFocus(onCloseAutoFocus)}
        initialFocus={
          initialFocus ??
          openAutoFocus(() => cancel ?? content, onOpenAutoFocus)
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
      </AlertDialogContentPart>
    </CancelContext>
  );
};
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
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
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
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
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = ({
  asChild,
  children,
  className,
  ...props
}: RadixPartProps<React.ComponentProps<typeof AlertDialogTitlePart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <AlertDialogTitlePart
      className={cn("text-lg font-semibold", className)}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </AlertDialogTitlePart>
  );
};
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = ({
  asChild,
  children,
  className,
  ...props
}: RadixPartProps<React.ComponentProps<typeof AlertDialogDescriptionPart>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <AlertDialogDescriptionPart
      className={cn("text-sm text-muted-foreground", className)}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </AlertDialogDescriptionPart>
  );
};
AlertDialogDescription.displayName = "AlertDialogDescription";

/** Confirms the question and closes the dialog. */
const AlertDialogAction = ({
  asChild,
  children,
  className,
  ...props
}: RadixPartProps<React.ComponentProps<typeof AlertDialogClose>>) => {
  const slot = asChildProps({ asChild, children });

  return (
    <AlertDialogClose
      className={cn(buttonVariants(), className)}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </AlertDialogClose>
  );
};
AlertDialogAction.displayName = "AlertDialogAction";

/** Dismisses the question and closes the dialog. Focus starts here. */
const AlertDialogCancel = ({
  asChild,
  children,
  className,
  ref,
  ...props
}: RadixPartProps<React.ComponentProps<typeof AlertDialogClose>>) => {
  const register = React.use(CancelContext);
  const [cancel, cancelReference] = useElementRef(ref);
  const slot = asChildProps({ asChild, children });

  React.useEffect(() => {
    register?.(cancel);
    return () => {
      register?.(null);
    };
  }, [cancel, register]);

  return (
    <AlertDialogClose
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className,
      )}
      ref={cancelReference}
      render={slot.render}
      {...props}
    >
      {slot.children}
    </AlertDialogClose>
  );
};
AlertDialogCancel.displayName = "AlertDialogCancel";

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
