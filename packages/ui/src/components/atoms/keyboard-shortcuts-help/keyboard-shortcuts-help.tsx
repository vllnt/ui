"use client";

import { Children, memo } from "react";

import {
  Dialog as DialogRoot,
  DialogBackdrop,
  DialogClose as DialogClosePart,
  DialogContent as DialogContentPart,
} from "@ui-sdk/react/dialog";
import type { ReactNode } from "react";

import type { Material, MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import type { HeadingTag } from "../../../lib/types";
import {
  dialogClose,
  dialogOverlay,
  dialogRoot,
  type OpenAliases,
  openAliases,
  type OverlayLook,
  useDialogPopup,
} from "../../../lib/ui-sdk-dialog";
import { cn } from "../../../lib/utils";

// An atom imports no other component, so this is a ui-sdk dialog of its own:
// the same panel and veil classes as `DialogContent`, with the sizing this help needs.
const ShortcutsRoot = /* @__PURE__ */ dialogRoot(
  "KeyboardShortcutsHelpRoot",
  DialogRoot,
);
const ShortcutsClose = /* @__PURE__ */ dialogClose(
  "KeyboardShortcutsHelpClose",
  DialogClosePart,
);
const VEIL_LOOK: OverlayLook = {
  veil: "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
};
const ShortcutsVeil = /* @__PURE__ */ dialogOverlay(
  "KeyboardShortcutsHelpVeil",
  DialogBackdrop,
  VEIL_LOOK,
);
const PANEL =
  "fixed left-[50%] top-[50%] z-50 vllnt-glass-floating vllnt-glass-dense block w-[calc(100%-2rem)] max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]";

export type KeyboardShortcut = {
  description: string;
  keys: readonly string[];
};

export type KeyboardShortcutsHelpProps = {
  /** Heading tag for the modal title. Defaults to `h2`. */
  as?: HeadingTag;
  className?: string;
  closeIcon?: ReactNode;
  footer?: ReactNode;
  shortcuts: readonly KeyboardShortcut[];
  title?: string;
} & MaterialProps &
  OpenAliases;

function DefaultCloseIcon(): React.ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function ShortcutsList({
  shortcuts,
}: Pick<KeyboardShortcutsHelpProps, "shortcuts">): React.ReactNode {
  return (
    <div className="space-y-3">
      {Children.toArray(
        shortcuts.map((shortcut) => (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {shortcut.description}
            </span>
            <div className="flex gap-1">
              {shortcut.keys.map((key) => (
                <kbd
                  className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs"
                  key={key}
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        )),
      )}
    </div>
  );
}

type ShortcutsHeaderProps = {
  as: HeadingTag;
  closeIcon?: ReactNode;
  title: string;
};

function ShortcutsHeader({
  as: Heading,
  closeIcon,
  title,
}: ShortcutsHeaderProps): React.ReactNode {
  return (
    <div className="flex items-center justify-between mb-4">
      <Heading className="text-lg font-semibold" id="shortcuts-title">
        {title}
      </Heading>
      <ShortcutsClose
        aria-label="Close shortcuts help"
        className="flex size-8 items-center justify-center rounded-md hover:bg-secondary"
      >
        {closeIcon ?? <DefaultCloseIcon />}
      </ShortcutsClose>
    </div>
  );
}

type ShortcutsPanelProps = {
  children: ReactNode;
  className?: string;
  material: Material;
};

function ShortcutsPanel({
  children,
  className,
  material,
}: ShortcutsPanelProps): React.ReactNode {
  const { openFocus, panelReference, render } = useDialogPopup({ names: {} });

  return (
    <>
      <ShortcutsVeil material={material} />
      <DialogContentPart
        aria-labelledby="shortcuts-title"
        className={cn(PANEL, className)}
        data-material={material}
        initialFocus={openFocus}
        ref={panelReference}
        render={render}
      >
        {children}
      </DialogContentPart>
    </>
  );
}

function KeyboardShortcutsHelpImpl({
  as: Heading = "h2",
  className,
  closeIcon,
  footer,
  isOpen,
  material = "glass",
  onClose,
  onOpenChange,
  open,
  shortcuts,
  title = "Keyboard Shortcuts",
}: KeyboardShortcutsHelpProps): React.ReactNode {
  const state = openAliases({ isOpen, onClose, onOpenChange, open });

  return (
    <ShortcutsRoot onOpenChange={state.handleOpenChange} open={state.open}>
      <ShortcutsPanel className={className} material={material}>
        <ShortcutsHeader as={Heading} closeIcon={closeIcon} title={title} />

        {/* Shortcuts List */}
        <ShortcutsList shortcuts={shortcuts} />

        {/* Footer */}
        {footer ? (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            {footer}
          </div>
        ) : null}
      </ShortcutsPanel>
    </ShortcutsRoot>
  );
}

export const KeyboardShortcutsHelp = /* @__PURE__ */ named(
  "KeyboardShortcutsHelp",
  /* @__PURE__ */ memo(KeyboardShortcutsHelpImpl),
);
