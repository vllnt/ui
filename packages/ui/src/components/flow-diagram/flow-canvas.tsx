'use client'

import { memo } from 'react'

import {
  Background,
  BackgroundVariant,
  type ColorMode,
  type FitViewOptions,
  type NodeMouseHandler,
  ReactFlow,
} from '@xyflow/react'
import { useTheme } from 'next-themes'

import { cn } from '../../lib/utils'

import { FlowControls } from './flow-controls'
import type { CopyStatus, FlowDiagramEdge, FlowDiagramNode } from './types'

type FlowCanvasProps = {
  allowCopy: boolean
  allowFullscreen: boolean
  className?: string
  copyStatus?: CopyStatus
  edges: FlowDiagramEdge[]
  fitView: boolean
  fitViewOptions?: FitViewOptions
  height: number | string
  isFullscreen: boolean
  nodes: FlowDiagramNode[]
  onCopy?: () => void
  onFitView: () => void
  onFullscreen?: () => void
  onNodeClick?: NodeMouseHandler
  onZoomIn: () => void
  onZoomOut: () => void
  showControls: boolean
  title?: string
}

const REACT_FLOW_CLASS = [
  // Node container styling — no !important on bg/color so inline styles take precedence
  '[&_.react-flow__node]:rounded-md',
  '[&_.react-flow__node]:border',
  '[&_.react-flow__node]:border-border',
  '[&_.react-flow__node]:bg-card',
  '[&_.react-flow__node]:px-4',
  '[&_.react-flow__node]:py-2',
  '[&_.react-flow__node]:shadow-sm',
  // Node text styling — defaults, overridable by inline style.color
  '[&_.react-flow__node]:text-sm',
  '[&_.react-flow__node]:text-card-foreground',
  '[&_.react-flow__node]:font-medium',
  // Edge styling
  '[&_.react-flow__edge-path]:!stroke-muted-foreground',
  '[&_.react-flow__edge-path]:!stroke-2',
  // Arrow marker styling
  '[&_.react-flow__arrowhead_polyline]:!fill-muted-foreground',
  '[&_.react-flow__arrowhead_polyline]:!stroke-muted-foreground',
].join(' ')

export const FlowCanvas = memo(function FlowCanvas({
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
  onCopy,
  onFitView,
  onFullscreen,
  onNodeClick,
  onZoomIn,
  onZoomOut,
  showControls,
  title,
}: FlowCanvasProps) {
  const { resolvedTheme } = useTheme()
  const colorMode: ColorMode = resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <div className={cn('relative w-full', className)}>
      {title ? <div className="mb-2 text-sm font-medium text-foreground">{title}</div> : null}
      <div
        className="relative w-full rounded-lg border border-border bg-background overflow-hidden"
        style={{ height: isFullscreen ? '100%' : height }}
      >
        <ReactFlow
          className={REACT_FLOW_CLASS}
          colorMode={colorMode}
          edges={edges}
          elementsSelectable={false}
          fitView={fitView}
          fitViewOptions={fitViewOptions ?? { padding: 0.2 }}
          nodes={nodes}
          nodesConnectable={false}
          nodesDraggable={false}
          onNodeClick={onNodeClick}
          panOnScroll
          proOptions={{ hideAttribution: true }}
          zoomOnScroll
        >
          <Background
            className="!bg-background [&>pattern>circle]:fill-muted-foreground/20"
            gap={16}
            size={1}
            variant={BackgroundVariant.Dots}
          />
          {showControls ? (
            <FlowControls
              copyStatus={copyStatus}
              onCopy={onCopy}
              onFitView={onFitView}
              onFullscreen={onFullscreen}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              showCopy={allowCopy}
              showFullscreen={allowFullscreen}
            />
          ) : null}
        </ReactFlow>
      </div>
    </div>
  )
})
