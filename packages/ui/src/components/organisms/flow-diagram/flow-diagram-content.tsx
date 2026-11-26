"use client";

import "@xyflow/react/dist/style.css";

import { lazy, memo, Suspense, useCallback, useEffect } from "react";

import {
  type Node,
  type NodeMouseHandler,
  ReactFlowProvider,
} from "@xyflow/react";
import type { ReactNode } from "react";

import { cn } from "../../../lib/utils";

import { FlowCanvas } from "./flow-canvas";
import type {
  FlowDiagramEdge,
  FlowDiagramNode,
  FlowDiagramProps,
} from "./types";
import { useFlowDiagram } from "./use-flow-diagram";

// The ui-sdk dialog loads when a diagram first goes fullscreen, not with the
// canvas; the placeholder in the page holds the diagram's place until then.
const FlowFullscreen = lazy(() =>
  import("./flow-fullscreen").then((module_) => ({
    default: module_.FlowFullscreen,
  })),
);

/**
 * Validates nodes and edges, logging warnings for common issues.
 */
function validateFlowData(
  nodes: FlowDiagramNode[],
  edges: FlowDiagramEdge[],
): void {
  if (nodes.length === 0 && edges.length > 0) {
    console.warn(
      "[FlowDiagram] Edges provided without nodes - edges will not render",
    );
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const invalidEdges = edges.filter(
    (e) => !nodeIds.has(e.source) || !nodeIds.has(e.target),
  );

  if (invalidEdges.length > 0) {
    console.warn(
      `[FlowDiagram] ${invalidEdges.length} edge(s) reference non-existent nodes:`,
      invalidEdges.map((e) => `${e.id}: ${e.source} -> ${e.target}`),
    );
  }

  const nodesWithoutPosition = nodes.filter((n) => n.position === undefined);
  if (nodesWithoutPosition.length > 0) {
    console.warn(
      `[FlowDiagram] ${nodesWithoutPosition.length} node(s) missing position:`,
      nodesWithoutPosition.map((n) => n.id),
    );
  }
}

/**
 * The diagram in fullscreen: a placeholder holds its place in the page while
 * the dialog loads, then the dialog shows the canvas.
 */
function FlowFullscreenView({
  children,
  className,
  height,
  onClose,
}: Pick<FlowDiagramProps, "className" | "height"> & {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={cn("rounded-lg border border-border bg-muted/50", className)}
        style={{ height }}
      />
      <Suspense fallback={null}>
        <FlowFullscreen isOpen onClose={onClose}>
          {children}
        </FlowFullscreen>
      </Suspense>
    </>
  );
}

const FlowDiagramInner = memo(function FlowDiagramInner({
  allowCopy = false,
  allowFullscreen = true,
  className,
  edges,
  fitView = true,
  fitViewOptions,
  height = 400,
  nodes,
  onNodeClick,
  showControls = true,
  title,
}: FlowDiagramProps) {
  // Check input on mount and when data changes
  useEffect(() => {
    validateFlowData(nodes, edges);
  }, [nodes, edges]);

  const {
    closeFullscreen,
    copyStatus,
    copyToClipboard,
    fitView: handleFitView,
    isFullscreen,
    toggleFullscreen,
    zoomIn,
    zoomOut,
  } = useFlowDiagram({ allowCopy, allowFullscreen });

  // Memoize node click handler to prevent unnecessary re-renders
  const handleNodeClick: NodeMouseHandler | undefined = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node as FlowDiagramNode);
    },
    [onNodeClick],
  );

  const handleCopy = useCallback(() => {
    void copyToClipboard();
  }, [copyToClipboard]);

  const canvasProps = {
    allowCopy,
    allowFullscreen,
    className,
    copyStatus,
    edges,
    fitView,
    fitViewOptions,
    height,
    isFullscreen,
    nodes,
    onCopy: allowCopy ? handleCopy : undefined,
    onFitView: handleFitView,
    onFullscreen: allowFullscreen ? toggleFullscreen : undefined,
    onNodeClick: onNodeClick ? handleNodeClick : undefined,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    showControls,
    title,
  };

  if (isFullscreen) {
    return (
      <FlowFullscreenView
        className={className}
        height={height}
        onClose={closeFullscreen}
      >
        <FlowCanvas {...canvasProps} />
      </FlowFullscreenView>
    );
  }

  return <FlowCanvas {...canvasProps} />;
});

/**
 * The @xyflow/react part of FlowDiagram: provider, controls and canvas, with no
 * error boundary or loading state. {@link FlowDiagram} loads it on demand; render
 * it directly to have @xyflow/react in your main bundle instead.
 */
export const FlowDiagramContent = memo(function FlowDiagramContent(
  props: FlowDiagramProps,
) {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
});
