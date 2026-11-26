"use client";

import { memo } from "react";

import type { ReactNode } from "react";

import type { MaterialProps } from "../../../lib/material";
import type { HeadingTag } from "../../../lib/types";
import { type OpenAliases, openAliases } from "../../../lib/ui-sdk-dialog";
import { cn } from "../../../lib/utils";
import { Sheet, SheetClose, SheetContent, SheetOverlay } from "../sheet/sheet";

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
  onReset?: () => void;
  onSelectSection: (index: number) => void;
  progressLabel?: string;
  resetLabel?: string;
  sections: TOCSection[];
  title?: string;
  totalSections: number;
} & MaterialProps &
  OpenAliases;

type TocHeaderProps = {
  closeIcon: ReactNode;
  Heading: HeadingTag;
  title: string;
};

function TocHeader({
  closeIcon,
  Heading,
  title,
}: TocHeaderProps): React.ReactNode {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <Heading className="text-lg font-semibold" id="toc-title">
        {title}
      </Heading>
      <SheetClose
        aria-label="Close table of contents"
        className="flex size-8 items-center justify-center rounded-md hover:bg-secondary"
      >
        {closeIcon ?? (
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
        )}
      </SheetClose>
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
        className="w-full rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
      <div className="mt-2 h-2 rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </div>
  );
}

type TocSectionListProps = Pick<
  TableOfContentsPanelProps,
  "completedSections" | "currentSectionIndex" | "onSelectSection" | "sections"
> & { onClose: () => void };

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
                    : "hover:bg-secondary text-foreground",
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
                      aria-hidden="true"
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
  material = "glass",
  onClose,
  onOpenChange,
  onReset,
  onSelectSection,
  open,
  progressLabel = "Progress",
  resetLabel = "Reset Progress",
  sections,
  title = "Table of Contents",
  totalSections,
}: TableOfContentsPanelProps): React.ReactNode {
  const state = openAliases({ isOpen, onClose, onOpenChange, open });

  return (
    <Sheet onOpenChange={state.handleOpenChange} open={state.open}>
      <SheetOverlay data-testid="toc-backdrop" material={material} />
      <SheetContent
        aria-labelledby="toc-title"
        className={cn(
          // Plain glass shadow: the sheet's floating shadow drops.
          "[--vllnt-glass-shadow:var(--shadow-glass)] w-full max-w-md gap-0 p-0 sm:max-w-md",
          className,
        )}
        closeButton={false}
        material={material}
        overlay="none"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <TocHeader closeIcon={closeIcon} Heading={Heading} title={title} />

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
            onClose={() => {
              state.handleOpenChange(false);
            }}
            onSelectSection={onSelectSection}
            sections={sections}
          />

          {/* Footer */}
          {completionCount > 0 && onReset ? (
            <TocFooter onReset={onReset} resetLabel={resetLabel} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const TableOfContentsPanel = memo(TableOfContentsPanelImpl);
TableOfContentsPanel.displayName = "TableOfContentsPanel";
