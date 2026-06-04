import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FlowDiagram } from "./flow-diagram";
import type { FlowDiagramEdge, FlowDiagramNode } from "./types";

type MockFlowNode = {
  data: {
    description?: string;
    label: string;
  };
  id: string;
  position?: {
    x: number;
    y: number;
  };
};

type MockFlowEdge = {
  id: string;
  source: string;
  target: string;
};

type MockReactFlowProps = {
  children?: React.ReactNode;
  colorMode?: string;
  edges: MockFlowEdge[];
  nodes: MockFlowNode[];
  onNodeClick?: (event: React.MouseEvent, node: MockFlowNode) => void;
};

const flowRuntime = vi.hoisted(() => {
  type RuntimeNode = {
    data: {
      description?: string;
      label: string;
    };
    id: string;
    position?: {
      x: number;
      y: number;
    };
  };

  const currentNodes: RuntimeNode[] = [];

  return {
    clipboardWrite: vi.fn(() => Promise.resolve()),
    currentNodes,
    fetchImage: vi.fn((input: string) =>
      Promise.resolve(
        new Response(new Blob([input], { type: "image/png" }), {
          status: 200,
        }),
      ),
    ),
    fitView: vi.fn(() => Promise.resolve()),
    getNodesBounds: vi.fn(() => ({
      height: 80,
      width: 120,
      x: 0,
      y: 0,
    })),
    getViewport: vi.fn(() => ({
      x: 0,
      y: 0,
      zoom: 1,
    })),
    getViewportForBounds: vi.fn(() => ({
      x: 10,
      y: 20,
      zoom: 1.25,
    })),
    toPng: vi.fn(() => Promise.resolve("data:image/png;base64,diagram")),
    zoomTo: vi.fn(() => Promise.resolve()),
  };
});

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("html-to-image", () => ({
  toPng: flowRuntime.toPng,
}));

vi.mock("@xyflow/react", () => ({
  Background: () => <div data-testid="flow-background" />,
  BackgroundVariant: { Dots: "dots" },
  getNodesBounds: flowRuntime.getNodesBounds,
  getViewportForBounds: flowRuntime.getViewportForBounds,
  ReactFlow: ({
    children,
    colorMode,
    edges,
    nodes,
    onNodeClick,
  }: MockReactFlowProps) => {
    const firstNode = nodes[0];
    const handleNodeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (firstNode) onNodeClick?.(event, firstNode);
    };

    return (
      <div
        className="react-flow__viewport"
        data-color-mode={colorMode}
        data-edge-count={edges.length}
        data-node-count={nodes.length}
        data-testid="react-flow"
      >
        <button onClick={handleNodeClick} type="button">
          Mock first node
        </button>
        {children}
      </div>
    );
  },
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow-provider">{children}</div>
  ),
  useReactFlow: () => ({
    fitView: flowRuntime.fitView,
    getNodes: () => flowRuntime.currentNodes,
    getViewport: flowRuntime.getViewport,
    zoomTo: flowRuntime.zoomTo,
  }),
}));

class TestClipboardItem {
  readonly items: Record<string, Blob>;

  constructor(items: Record<string, Blob>) {
    this.items = items;
  }
}

const nodes: FlowDiagramNode[] = [
  {
    data: { description: "Entry point", label: "Start" },
    id: "start",
    position: { x: 0, y: 0 },
  },
  {
    data: { description: "Exit point", label: "End" },
    id: "end",
    position: { x: 220, y: 0 },
  },
];

const edges: FlowDiagramEdge[] = [
  { id: "start-end", source: "start", target: "end" },
];

function setRuntimeNodes(nextNodes: FlowDiagramNode[]) {
  flowRuntime.currentNodes.splice(
    0,
    flowRuntime.currentNodes.length,
    ...nextNodes,
  );
}

function getReactFlowParent(): HTMLElement {
  const parent = screen.getByTestId("react-flow").parentElement;
  if (!parent) throw new Error("Expected ReactFlow parent element");
  return parent;
}

describe("FlowDiagram", () => {
  beforeEach(() => {
    setRuntimeNodes(nodes);
    flowRuntime.clipboardWrite.mockReset();
    flowRuntime.clipboardWrite.mockResolvedValue();
    flowRuntime.fetchImage.mockClear();
    flowRuntime.fitView.mockClear();
    flowRuntime.getNodesBounds.mockClear();
    flowRuntime.getViewport.mockClear();
    flowRuntime.getViewportForBounds.mockClear();
    flowRuntime.toPng.mockClear();
    flowRuntime.toPng.mockResolvedValue("data:image/png;base64,diagram");
    flowRuntime.zoomTo.mockClear();

    vi.stubGlobal("ClipboardItem", TestClipboardItem);
    vi.stubGlobal("fetch", flowRuntime.fetchImage);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => {
        callback(0);
      }, 0),
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      window.clearTimeout(id);
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write: flowRuntime.clipboardWrite },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.style.overflow = "";
  });

  it("renders title, canvas sizing, controls, and graph data", () => {
    render(
      <FlowDiagram
        allowCopy
        allowFullscreen
        edges={edges}
        height={320}
        nodes={nodes}
        title="Pipeline"
      />,
    );

    expect(screen.getByText("Pipeline")).toBeInTheDocument();
    expect(screen.getByTestId("react-flow")).toHaveAttribute(
      "data-node-count",
      "2",
    );
    expect(screen.getByTestId("react-flow")).toHaveAttribute(
      "data-edge-count",
      "1",
    );
    expect(getReactFlowParent()).toHaveStyle({ height: "320px" });
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
    expect(screen.getByLabelText("Fit view")).toBeInTheDocument();
    expect(screen.getByLabelText("Copy as image")).toBeInTheDocument();
    expect(screen.getByLabelText("Fullscreen")).toBeInTheDocument();
  });

  it("hides controls when showControls is false", () => {
    render(
      <FlowDiagram
        edges={edges}
        nodes={nodes}
        showControls={false}
        title="No controls"
      />,
    );

    expect(screen.getByText("No controls")).toBeInTheDocument();
    expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
  });

  it("warns for invalid flow data", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => null);

    render(
      <FlowDiagram
        edges={[{ id: "missing", source: "start", target: "missing" }]}
        nodes={[{ data: { label: "Start" }, id: "start" }]}
      />,
    );

    expect(warn).toHaveBeenCalledWith(
      "[FlowDiagram] 1 edge(s) reference non-existent nodes:",
      ["missing: start -> missing"],
    );
    expect(warn).toHaveBeenCalledWith(
      "[FlowDiagram] 1 node(s) missing position:",
      ["start"],
    );
  });

  it("wires zoom, fit view, and node click handlers", () => {
    const onNodeClick = vi.fn();

    render(
      <FlowDiagram edges={edges} nodes={nodes} onNodeClick={onNodeClick} />,
    );

    fireEvent.click(screen.getByLabelText("Zoom in"));
    fireEvent.click(screen.getByLabelText("Fit view"));
    fireEvent.click(screen.getByText("Mock first node"));

    expect(flowRuntime.zoomTo).toHaveBeenCalledWith(1.2, { duration: 200 });
    expect(flowRuntime.fitView).toHaveBeenCalledWith({
      duration: 200,
      padding: 0.2,
    });
    expect(onNodeClick).toHaveBeenCalledWith(nodes[0]);
  });

  it("opens fullscreen mode and closes it from the portal control", () => {
    render(<FlowDiagram allowFullscreen edges={edges} nodes={nodes} />);

    fireEvent.click(screen.getByLabelText("Fullscreen"));

    expect(
      screen.getByRole("dialog", { name: "Flow diagram fullscreen view" }),
    ).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByLabelText("Close fullscreen"));

    expect(
      screen.queryByRole("dialog", { name: "Flow diagram fullscreen view" }),
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("copies the rendered flow image to the clipboard", async () => {
    render(<FlowDiagram allowCopy edges={edges} nodes={nodes} />);

    fireEvent.click(screen.getByLabelText("Copy as image"));

    await waitFor(() => {
      expect(flowRuntime.clipboardWrite).toHaveBeenCalledTimes(1);
    });
    expect(flowRuntime.getNodesBounds).toHaveBeenCalledWith(nodes);
    expect(flowRuntime.getViewportForBounds).toHaveBeenCalledWith(
      { height: 80, width: 120, x: 0, y: 0 },
      1024,
      768,
      0.5,
      2,
      0.2,
    );
    expect(flowRuntime.toPng).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        backgroundColor: "white",
        height: 768,
        width: 1024,
      }),
    );
    expect(screen.getByLabelText("Copied!")).toBeInTheDocument();
  });
});
