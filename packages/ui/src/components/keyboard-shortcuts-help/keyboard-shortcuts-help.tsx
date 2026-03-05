"use client";

import { memo, useEffect, useRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type KeyboardShortcut = {
  description: string;
  keys: readonly string[];
};

export type KeyboardShortcutsHelpProps = {
  className?: string;
  closeIcon?: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  shortcuts: readonly KeyboardShortcut[];
  title?: string;
};

// eslint-disable-next-line max-lines-per-function -- Modal with keyboard handling and focus trap
function KeyboardShortcutsHelpImpl({
  className,
  closeIcon,
  footer,
  isOpen,
  onClose,
  shortcuts,
  title = "Keyboard Shortcuts",
}: KeyboardShortcutsHelpProps): React.ReactNode {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and close on Escape
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby="shortcuts-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 w-full max-w-sm rounded-lg bg-background p-6 shadow-xl mx-4",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" id="shortcuts-title">
            {title}
          </h2>
          <button
            aria-label="Close shortcuts help"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            {closeIcon ?? (
              <svg
                className="h-5 w-5"
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
            )}
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div
              className="flex items-center justify-between text-sm"
              key={shortcut.description}
            >
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
          ))}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const KeyboardShortcutsHelp = memo(KeyboardShortcutsHelpImpl);
KeyboardShortcutsHelp.displayName = "KeyboardShortcutsHelp";
