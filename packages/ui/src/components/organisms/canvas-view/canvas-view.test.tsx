import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanvasView } from "./canvas-view";

const workspace = () =>
  screen.getByRole("region", { name: "Canvas workspace" });

const focusedWorkspace = () => {
  const viewport = workspace();
  viewport.focus();
  return viewport;
};

describe("CanvasView", () => {
  it("announces interaction guidance, renders children, and prevents text selection", () => {
    render(
      <CanvasView>
        <div>scene object</div>
      </CanvasView>,
    );
    expect(screen.getByText("scene object")).toBeInTheDocument();
    expect(screen.getByText(/hold space and drag/i)).toBeInTheDocument();
    expect(workspace()).toHaveClass("select-none");
  });

  it("zooms with modified wheel input", () => {
    const onViewportChange = vi.fn();
    render(<CanvasView onViewportChange={onViewportChange} />);
    fireEvent.wheel(workspace(), { ctrlKey: true, deltaY: -100 });
    expect(onViewportChange).toHaveBeenLastCalledWith({
      x: 0,
      y: 0,
      zoom: 1.1,
    });
  });

  it("pans with arrow keys", () => {
    const onViewportChange = vi.fn();
    render(<CanvasView onViewportChange={onViewportChange} />);
    fireEvent.keyDown(focusedWorkspace(), { key: "ArrowRight" });
    expect(onViewportChange).toHaveBeenLastCalledWith({
      x: -40,
      y: 0,
      zoom: 1,
    });
  });

  it("preserves pointer access to canvas children", () => {
    const onClick = vi.fn();
    render(
      <CanvasView>
        <button onClick={onClick} type="button">
          node action
        </button>
      </CanvasView>,
    );
    fireEvent.click(screen.getByRole("button", { name: "node action" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("resets the viewport with the zero key", () => {
    const onViewportChange = vi.fn();
    render(
      <CanvasView
        defaultViewport={{ x: 24, y: 32, zoom: 1.2 }}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.keyDown(focusedWorkspace(), { key: "0" });
    expect(onViewportChange).toHaveBeenLastCalledWith({
      x: 24,
      y: 32,
      zoom: 1.2,
    });
  });

  it("does not steal wheel events from nested scroll containers", () => {
    const onViewportChange = vi.fn();
    render(
      <CanvasView onViewportChange={onViewportChange}>
        <div
          data-testid="nested-scroll"
          style={{ maxHeight: 80, overflowY: "auto" }}
        >
          <div style={{ height: 240 }}>Scrollable canvas node</div>
        </div>
      </CanvasView>,
    );
    const nestedScroll = screen.getByTestId("nested-scroll");
    Object.defineProperty(nestedScroll, "clientHeight", {
      configurable: true,
      value: 80,
    });
    Object.defineProperty(nestedScroll, "scrollHeight", {
      configurable: true,
      value: 240,
    });
    fireEvent.wheel(nestedScroll, { deltaY: 40 });
    expect(onViewportChange).not.toHaveBeenCalled();
  });

  it("does not steal keyboard input from nested form controls", () => {
    const onViewportChange = vi.fn();
    render(
      <CanvasView onViewportChange={onViewportChange}>
        <input aria-label="Node title" />
      </CanvasView>,
    );
    const input = screen.getByRole("textbox", { name: "Node title" });
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "0" });
    fireEvent.keyDown(input, { key: "+" });
    expect(onViewportChange).not.toHaveBeenCalled();
  });

  it("calls preventDefault on a handled canvas wheel (non-passive intent)", () => {
    render(<CanvasView />);
    // fireEvent returns false when a cancelable event had preventDefault
    // called. A native non-passive wheel listener drives the canvas; this
    // guards that the handler still calls preventDefault.
    expect(fireEvent.wheel(workspace(), { deltaY: 120 })).toBe(false);
  });

  it("resets the space-pan state when the canvas loses focus", () => {
    render(<CanvasView />);
    const viewport = focusedWorkspace();
    fireEvent.keyDown(viewport, { key: " " });
    expect(viewport).toHaveClass("cursor-grab");
    fireEvent.blur(viewport);
    expect(viewport).toHaveClass("cursor-default");
    expect(viewport).not.toHaveClass("cursor-grab");
  });
});

describe("CanvasView semantics", () => {
  it("is a focusable region, not a button wrapping interactive children", () => {
    render(
      <CanvasView>
        <button type="button">node action</button>
      </CanvasView>,
    );
    expect(workspace()).toHaveAttribute("tabindex", "0");
    expect(
      screen.queryByRole("button", { name: "Canvas workspace" }),
    ).not.toBeInTheDocument();
  });
});
