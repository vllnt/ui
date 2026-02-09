'use client'

import { useCallback, useEffect, useState } from 'react'

import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react'
import { toPng } from 'html-to-image'

import type { CopyStatus, UseFlowDiagramOptions, UseFlowDiagramReturn } from './types'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 2
const ZOOM_STEP = 0.2

function useZoomControls(reactFlow: ReturnType<typeof useReactFlow>) {
  const [zoom, setZoom] = useState(1)

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM)
    setZoom(newZoom)
    void reactFlow.zoomTo(newZoom, { duration: 200 })
  }, [zoom, reactFlow])

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM)
    setZoom(newZoom)
    void reactFlow.zoomTo(newZoom, { duration: 200 })
  }, [zoom, reactFlow])

  const fitView = useCallback(() => {
    void reactFlow.fitView({ duration: 200, padding: 0.2 })
  }, [reactFlow])

  // Sync zoom state with react flow viewport
  useEffect(() => {
    const viewport = reactFlow.getViewport()
    setZoom(viewport.zoom)
  }, [reactFlow])

  return { fitView, zoom, zoomIn, zoomOut }
}

function useFullscreenState(allowFullscreen: boolean) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    if (!allowFullscreen) return
    setIsFullscreen((previous) => !previous)
  }, [allowFullscreen])

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false)
  }, [])

  // Handle ESC key to close fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, closeFullscreen])

  // Prevent body scroll when fullscreen
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  return { closeFullscreen, isFullscreen, toggleFullscreen }
}

const IMAGE_WIDTH = 1024
const IMAGE_HEIGHT = 768
const COPY_SUCCESS_DURATION = 2000

async function captureFlowImage(reactFlow: ReturnType<typeof useReactFlow>): Promise<Blob> {
  const nodes = reactFlow.getNodes()
  if (nodes.length === 0) {
    throw new Error('Cannot copy: no nodes in diagram')
  }

  const nodesBounds = getNodesBounds(nodes)
  const viewport = getViewportForBounds(nodesBounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.5, 2, 0.2)

  const flowElement = document.querySelector('.react-flow__viewport')
  if (!flowElement || !(flowElement instanceof HTMLElement)) {
    throw new Error('Cannot copy: flow viewport element not found')
  }

  const dataUrl = await toPng(flowElement, {
    backgroundColor: 'white',
    height: IMAGE_HEIGHT,
    style: {
      height: String(IMAGE_HEIGHT),
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      width: String(IMAGE_WIDTH),
    },
    width: IMAGE_WIDTH,
  })

  const response = await fetch(dataUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch image data')
  }

  return response.blob()
}

function useCopyToClipboard(reactFlow: ReturnType<typeof useReactFlow>) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  const copyToClipboard = useCallback(async () => {
    setCopyStatus('copying')

    try {
      const blob = await captureFlowImage(reactFlow)
      const clipboardItem = new ClipboardItem({ ['image/png']: blob })
      await navigator.clipboard.write([clipboardItem])

      setCopyStatus('success')
      setTimeout(() => {
        setCopyStatus('idle')
      }, COPY_SUCCESS_DURATION)
    } catch (error) {
      console.error('[FlowDiagram] Copy failed:', error)
      setCopyStatus('error')
      setTimeout(() => {
        setCopyStatus('idle')
      }, COPY_SUCCESS_DURATION)
    }
  }, [reactFlow])

  return { copyStatus, copyToClipboard }
}

/**
 * Hook for controlling FlowDiagram behavior.
 * Provides zoom, fullscreen, and copy-to-clipboard functionality.
 *
 * @example
 * ```tsx
 * function MyFlowControls() {
 *   const { zoomIn, zoomOut, copyToClipboard, copyStatus } = useFlowDiagram()
 *
 *   return (
 *     <>
 *       <button onClick={zoomIn}>+</button>
 *       <button onClick={zoomOut}>-</button>
 *       <button onClick={copyToClipboard} disabled={copyStatus === 'copying'}>
 *         {copyStatus === 'copying' ? 'Copying...' : 'Copy'}
 *       </button>
 *     </>
 *   )
 * }
 * ```
 */
export function useFlowDiagram(options: UseFlowDiagramOptions = {}): UseFlowDiagramReturn {
  const { allowFullscreen = true } = options
  const reactFlow = useReactFlow()

  const { fitView, zoom, zoomIn, zoomOut } = useZoomControls(reactFlow)
  const { closeFullscreen, isFullscreen, toggleFullscreen } = useFullscreenState(allowFullscreen)
  const { copyStatus, copyToClipboard } = useCopyToClipboard(reactFlow)

  return {
    closeFullscreen,
    copyStatus,
    copyToClipboard,
    fitView,
    isFullscreen,
    toggleFullscreen,
    zoom,
    zoomIn,
    zoomOut,
  }
}
