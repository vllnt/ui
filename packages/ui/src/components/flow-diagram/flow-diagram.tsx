'use client'

import '@xyflow/react/dist/style.css'

import { memo, useCallback, useEffect } from 'react'

import { type Node, type NodeMouseHandler, ReactFlowProvider } from '@xyflow/react'

import { cn } from '../../lib/utils'

import { FlowCanvas } from './flow-canvas'
import { FlowErrorBoundary } from './flow-error-boundary'
import { FlowFullscreen } from './flow-fullscreen'
import type { FlowDiagramEdge, FlowDiagramNode, FlowDiagramProps } from './types'
import { useFlowDiagram } from './use-flow-diagram'

/**
 * Validates nodes and edges, logging warnings for common issues.
 */
function validateFlowData(nodes: FlowDiagramNode[], edges: FlowDiagramEdge[]): void {
  if (nodes.length === 0 && edges.length > 0) {
    console.warn('[FlowDiagram] Edges provided without nodes - edges will not render')
  }

  const nodeIds = new Set(nodes.map((n) => n.id))
  const invalidEdges = edges.filter((e) => !nodeIds.has(e.source) || !nodeIds.has(e.target))

  if (invalidEdges.length > 0) {
    console.warn(
      `[FlowDiagram] ${invalidEdges.length} edge(s) reference non-existent nodes:`,
      invalidEdges.map((e) => `${e.id}: ${e.source} -> ${e.target}`),
    )
  }

  const nodesWithoutPosition = nodes.filter((n) => n.position === undefined)
  if (nodesWithoutPosition.length > 0) {
    console.warn(
      `[FlowDiagram] ${nodesWithoutPosition.length} node(s) missing position:`,
      nodesWithoutPosition.map((n) => n.id),
    )
  }
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
    validateFlowData(nodes, edges)
  }, [nodes, edges])

  const {
    closeFullscreen,
    copyStatus,
    copyToClipboard,
    fitView: handleFitView,
    isFullscreen,
    toggleFullscreen,
    zoomIn,
    zoomOut,
  } = useFlowDiagram({ allowCopy, allowFullscreen })

  // Memoize node click handler to prevent unnecessary re-renders
  const handleNodeClick: NodeMouseHandler | undefined = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node as FlowDiagramNode)
    },
    [onNodeClick],
  )

  const handleCopy = useCallback(() => {
    void copyToClipboard()
  }, [copyToClipboard])

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
  }

  if (isFullscreen) {
    return (
      <>
        <div
          className={cn('rounded-lg border border-border bg-muted/50', className)}
          style={{ height }}
        />
        <FlowFullscreen isOpen={isFullscreen} onClose={closeFullscreen}>
          <FlowCanvas {...canvasProps} />
        </FlowFullscreen>
      </>
    )
  }

  return <FlowCanvas {...canvasProps} />
})

/**
 * FlowDiagram component for rendering interactive flow diagrams.
 * Uses @xyflow/react under the hood with error boundary protection.
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
      <ReactFlowProvider>
        <FlowDiagramInner {...props} />
      </ReactFlowProvider>
    </FlowErrorBoundary>
  )
})
