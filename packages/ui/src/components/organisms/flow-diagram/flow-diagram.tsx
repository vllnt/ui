"use client";

import { lazy, memo, Suspense } from "react";

import { cn } from "../../../lib/utils";

import { FlowErrorBoundary } from "./flow-error-boundary";
import type { FlowDiagramProps } from "./types";

// @xyflow/react is ~185 KB: it loads when a diagram first renders.
const FlowDiagramContent = lazy(() =>
  import("./flow-diagram-content").then((module_) => ({
    default: module_.FlowDiagramContent,
  })),
);

/** Holds the diagram's place, with the title and height the canvas will have. */
function FlowDiagramFallback({
  className,
  height = 400,
  title,
}: FlowDiagramProps) {
  return (
    <div className={cn("relative w-full", className)} role="status">
      {title ? (
        <div className="mb-2 text-sm font-medium text-foreground">{title}</div>
      ) : null}
      <div
        className="relative w-full rounded-lg border border-border bg-background overflow-hidden"
        style={{ height }}
      >
        <span className="sr-only">Loading diagram...</span>
      </div>
    </div>
  );
}

/**
 * FlowDiagram component for rendering interactive flow diagrams.
 * Uses @xyflow/react under the hood with error boundary protection. The
 * library loads on demand; a placeholder of the same size shows meanwhile.
 *
 * @example
 * ```tsx
 * <FlowDiagram
 *   nodes={[
 *     { id: '1', data: { label: 'Start' }, position: { x: 0, y: 0 } },
 *     { id: '2', data: { label: 'End' }, position: { x: 200, y: 100 } }
 *   ]}
 *   edges={[{ id: 'e1-2', source: '1', target: '2' }]}
 *   showControls
 *   allowFullscreen
 * />
 * ```
 */
export const FlowDiagram = memo(function FlowDiagram(props: FlowDiagramProps) {
  return (
    <FlowErrorBoundary height={props.height}>
      <Suspense fallback={<FlowDiagramFallback {...props} />}>
        <FlowDiagramContent {...props} />
      </Suspense>
    </FlowErrorBoundary>
  );
});
