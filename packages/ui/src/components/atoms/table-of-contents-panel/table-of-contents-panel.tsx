"use client";

import { memo, useEffect, useRef } from "react";

import type { ReactNode } from "react";

import type { HeadingTag } from "../../../lib/types";
import { useBodyScrollLock } from "../../../lib/use-body-scroll-lock";
import { useEscapeKey } from "../../../lib/use-escape-key";
import { cn } from "../../../lib/utils";

export type TOCSection = {
  id: string;
  title: string;
};

export type TableOfContentsPanelProps = {
  /** Heading tag for the panel title. Defaults to `h2`. */
  as?: HeadingTag;
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

function useTocPanelBehavior(
  isOpen: boolean,
  onClose: () => void,
): {
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
} {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus to the close button when the panel opens.
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEscapeKey(onClose, { enabled: isOpen, preventDefault: true });
  useBodyScrollLock(isOpen);

  return { closeButtonRef, panelRef };
}

function TocBackdrop({ onClose }: { onClose: () => void }): React.ReactNode {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      data-testid="toc-backdrop"
      onClick={onClose}
    />
  );
}

type TocHeaderProps = {
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  closeIcon: ReactNode;
  Heading: HeadingTag;
  onClose: () => void;
  title: string;
};

function TocHeader({
  closeButtonRef,
  closeIcon,
  Heading,
  onClose,
  title,
}: TocHeaderProps): React.ReactNode {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <Heading className="text-lg font-semibold" id="toc-title">
        {title}
      </Heading>
      <button
        aria-label="Close table of contents"
        className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
        onClick={onClose}
        ref={closeButtonRef}
        type="button"
      >
        {closeIcon ?? (
          <svg
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
        )}
      </button>
    </div>
  );
}

type TocFooterProps = {
  onReset: () => void;
  resetLabel: string;
};

function TocFooter({ onReset, resetLabel }: TocFooterProps): React.ReactNode {
  return (
    <div className="border-t border-border px-4 py-3">
      <button
        className="w-full rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        onClick={onReset}
        type="button"
      >
        {resetLabel}
      </button>
    </div>
  );
}

type TocProgressProps = {
  completionCount: number;
  progressLabel: string;
  totalSections: number;
};

function TocProgress({
  completionCount,
  progressLabel,
  totalSections,
}: TocProgressProps): React.ReactNode {
  const completionPercent =
    totalSections > 0 ? Math.round((completionCount / totalSections) * 100) : 0;

  return (
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
  );
}

type TocSectionListProps = Pick<
  TableOfContentsPanelProps,
  | "completedSections"
  | "currentSectionIndex"
  | "onClose"
  | "onSelectSection"
  | "sections"
>;

function TocSectionList({
  completedSections,
  currentSectionIndex,
  onClose,
  onSelectSection,
  sections,
}: TocSectionListProps): React.ReactNode {
  return (
    <nav aria-label="Sections" className="flex-1 overflow-y-auto px-4 py-3">
      <ol className="space-y-1">
        {sections.map((section, index) => {
          const isCompleted = completedSections.has(section.id);
          const isCurrent = index === currentSectionIndex;

          return (
            <li key={section.id}>
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
                    "flex size-5 shrink-0 items-center justify-center rounded-full border",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="size-3"
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
                <span className={isCompleted ? "line-through opacity-60" : ""}>
                  {section.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function TableOfContentsPanelImpl({
  as: Heading = "h2",
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
  const { closeButtonRef, panelRef } = useTocPanelBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby="toc-title"
      aria-modal="true"
      className="fixed inset-0 z-50"
      role="dialog"
    >
      {/* Backdrop */}
      <TocBackdrop onClose={onClose} />

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
          <TocHeader
            closeButtonRef={closeButtonRef}
            closeIcon={closeIcon}
            Heading={Heading}
            onClose={onClose}
            title={title}
          />

          {/* Progress */}
          <TocProgress
            completionCount={completionCount}
            progressLabel={progressLabel}
            totalSections={totalSections}
          />

          {/* Sections List */}
          <TocSectionList
            completedSections={completedSections}
            currentSectionIndex={currentSectionIndex}
            onClose={onClose}
            onSelectSection={onSelectSection}
            sections={sections}
          />

          {/* Footer */}
          {completionCount > 0 && onReset ? (
            <TocFooter onReset={onReset} resetLabel={resetLabel} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const TableOfContentsPanel = memo(TableOfContentsPanelImpl);
TableOfContentsPanel.displayName = "TableOfContentsPanel";
