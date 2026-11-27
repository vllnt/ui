"use client";

import { memo } from "react";

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
// the same side panel and veil classes as `SheetContent`, on the right edge.
const TocRoot = /* @__PURE__ */ dialogRoot(
  "TableOfContentsPanelRoot",
  DialogRoot,
);
const TocClose = /* @__PURE__ */ dialogClose(
  "TableOfContentsPanelClose",
  DialogClosePart,
);
const VEIL_LOOK: OverlayLook = {
  veil: "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
};
const TocVeil = /* @__PURE__ */ dialogOverlay(
  "TableOfContentsPanelVeil",
  DialogBackdrop,
  VEIL_LOOK,
);
// The plain glass shadow replaces the floating shadow of `vllnt-glass-floating`.
const SIDE_PANEL =
  "vllnt-glass-floating vllnt-glass-dense fixed inset-y-0 right-0 z-50 h-full w-full max-w-md border-l transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right [--vllnt-glass-shadow:var(--shadow-glass)]";

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
      <TocClose
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
      </TocClose>
    </div>
  );
}

type TocPanelProps = {
  children: ReactNode;
  className?: string;
  material: Material;
};

function TocPanel({
  children,
  className,
  material,
}: TocPanelProps): React.ReactNode {
  const { openFocus, panelReference, render } = useDialogPopup({ names: {} });

  return (
    <>
      <TocVeil data-testid="toc-backdrop" material={material} />
      <DialogContentPart
        aria-labelledby="toc-title"
        className={cn(SIDE_PANEL, className)}
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
    <TocRoot onOpenChange={state.handleOpenChange} open={state.open}>
      <TocPanel className={className} material={material}>
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
      </TocPanel>
    </TocRoot>
  );
}

export const TableOfContentsPanel = /* @__PURE__ */ named(
  "TableOfContentsPanel",
  /* @__PURE__ */ memo(TableOfContentsPanelImpl),
);
