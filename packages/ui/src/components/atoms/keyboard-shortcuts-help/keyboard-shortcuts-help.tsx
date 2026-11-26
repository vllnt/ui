"use client";

import { Children, memo } from "react";

import type { ReactNode } from "react";

import type { MaterialProps } from "../../../lib/material";
import type { HeadingTag } from "../../../lib/types";
import { type OpenAliases, openAliases } from "../../../lib/ui-sdk-dialog";
import { cn } from "../../../lib/utils";
import { Dialog, DialogClose, DialogContent } from "../dialog/dialog";

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
      <DialogClose
        aria-label="Close shortcuts help"
        className="flex size-8 items-center justify-center rounded-md hover:bg-secondary"
      >
        {closeIcon ?? <DefaultCloseIcon />}
      </DialogClose>
    </div>
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
    <Dialog onOpenChange={state.handleOpenChange} open={state.open}>
      <DialogContent
        aria-labelledby="shortcuts-title"
        className={cn(
          "block w-[calc(100%-2rem)] max-w-sm rounded-lg",
          className,
        )}
        closeButton={false}
        material={material}
      >
        <ShortcutsHeader as={Heading} closeIcon={closeIcon} title={title} />

        {/* Shortcuts List */}
        <ShortcutsList shortcuts={shortcuts} />

        {/* Footer */}
        {footer ? (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export const KeyboardShortcutsHelp = memo(KeyboardShortcutsHelpImpl);
KeyboardShortcutsHelp.displayName = "KeyboardShortcutsHelp";
