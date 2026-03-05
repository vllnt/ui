"use client";

import { memo, useEffect, useRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type TOCSection = {
  id: string;
  title: string;
};

export type TableOfContentsPanelProps = {
  className?: string;
  closeIcon?: ReactNode;
  completedSections: Set<string>;
  completionCount: number;
  currentSectionIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
  onSelectSection: (index: number) => void;
  progressLabel?: string;
  resetLabel?: string;
  sections: TOCSection[];
  title?: string;
  totalSections: number;
};

// eslint-disable-next-line max-lines-per-function -- Complex panel with progress and section list
function TableOfContentsPanelImpl({
  className,
  closeIcon,
  completedSections,
  completionCount,
  currentSectionIndex,
  isOpen,
  onClose,
  onReset,
  onSelectSection,
  progressLabel = "Progress",
  resetLabel = "Reset Progress",
  sections,
  title = "Table of Contents",
  totalSections,
}: TableOfContentsPanelProps): React.ReactNode {
  const panelRef = useRef<HTMLDivElement>(null);
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

  const completionPercent =
    totalSections > 0 ? Math.round((completionCount / totalSections) * 100) : 0;

  return (
    <div
      aria-labelledby="toc-title"
      aria-modal="true"
      className="fixed inset-0 z-50"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl",
          className,
        )}
        ref={panelRef}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold" id="toc-title">
              {title}
            </h2>
            <button
              aria-label="Close table of contents"
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

          {/* Progress */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progressLabel}</span>
              <span className="font-medium">
                {completionCount} / {totalSections} ({completionPercent}%)
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Sections List */}
          <nav
            aria-label="Sections"
            className="flex-1 overflow-y-auto px-4 py-3"
          >
            <ol className="space-y-1">
              {sections.map((section, index) => {
                const isCompleted = completedSections.has(section.id);
                const isCurrent = index === currentSectionIndex;

                return (
                  <li key={`${section.id}-${index}`}>
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isCurrent
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-foreground",
                      )}
                      onClick={() => {
                        onSelectSection(index);
                        onClose();
                      }}
                      type="button"
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground",
                        )}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </span>
                      <span
                        className={isCompleted ? "line-through opacity-60" : ""}
                      >
                        {section.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Footer */}
          {completionCount > 0 && onReset ? (
            <div className="border-t border-border px-4 py-3">
              <button
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={onReset}
                type="button"
              >
                {resetLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const TableOfContentsPanel = memo(TableOfContentsPanelImpl);
TableOfContentsPanel.displayName = "TableOfContentsPanel";
