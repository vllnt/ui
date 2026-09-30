import type { Edge, FitViewOptions, Node } from "@xyflow/react";

export type FlowDiagramNode = {
  data: {
    description?: string;
    label: string;
  };
} & Node;

export type FlowDiagramEdge = {
  animated?: boolean;
} & Edge;

export type FlowDiagramProps = {
  /** Enable copy to clipboard button */
  allowCopy?: boolean;
  /** Enable fullscreen toggle button */
  allowFullscreen?: boolean;
  /** CSS class name for container */
  className?: string;
  /** Array of edges connecting nodes */
  edges: FlowDiagramEdge[];
  /** Auto-fit view on mount */
  fitView?: boolean;
  /** Options for fitView behavior */
  fitViewOptions?: FitViewOptions;
  /** Container height in pixels or CSS value */
  height?: number | string;
  /** Array of nodes to render */
  nodes: FlowDiagramNode[];
  /** Node click handler */
  onNodeClick?: (node: FlowDiagramNode) => void;
  /** Show zoom/pan/center controls */
  showControls?: boolean;
  /** Title displayed above the diagram */
  title?: string;
};

export type FlowControlsProps = {
  /** CSS class name */
  className?: string;
  /** Current copy operation status */
  copyStatus?: CopyStatus;
  /** Callback to copy diagram as image */
  onCopy?: () => void;
  /** Callback to fit/center view */
  onFitView: () => void;
  /** Callback to toggle fullscreen */
  onFullscreen?: () => void;
  /** Callback to zoom in */
  onZoomIn: () => void;
  /** Callback to zoom out */
  onZoomOut: () => void;
  /** Show copy button */
  showCopy?: boolean;
  /** Show fullscreen button */
  showFullscreen?: boolean;
};

export type FlowFullscreenProps = {
  /** Children to render in fullscreen */
  children: React.ReactNode;
  /** Whether fullscreen is active */
  isOpen: boolean;
  /** Callback to close fullscreen */
  onClose: () => void;
};

export type UseFlowDiagramOptions = {
  /** Enable copy capability */
  allowCopy?: boolean;
  /** Enable fullscreen capability */
  allowFullscreen?: boolean;
  /** Initial zoom level */
  initialZoom?: number;
};

/** Copy operation status */
export type CopyStatus = "copying" | "error" | "idle" | "success";

export type UseFlowDiagramReturn = {
  /** Close fullscreen */
  closeFullscreen: () => void;
  /** Current copy operation status */
  copyStatus: CopyStatus;
  /** Copy diagram to clipboard as image */
  copyToClipboard: () => Promise<void>;
  /** Fit view handler */
  fitView: () => void;
  /** Whether fullscreen is active */
  isFullscreen: boolean;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** Current zoom level */
  zoom: number;
  /** Zoom in handler */
  zoomIn: () => void;
  /** Zoom out handler */
  zoomOut: () => void;
};
