import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanvasView } from "./canvas-view";

describe("CanvasView", () => {
  it("announces interaction guidance and renders children", () => {
    render(
      <CanvasView>
        <div>scene object</div>
      </CanvasView>,
    );

    expect(screen.getByText("scene object")).toBeInTheDocument();
    expect(screen.getByText(/hold space and drag/i)).toBeInTheDocument();
  });

  it("zooms with modified wheel input", () => {
    const onViewportChange = vi.fn();

    render(<CanvasView onViewportChange={onViewportChange} />);

    fireEvent.wheel(screen.getByRole("button", { name: "Canvas workspace" }), {
      ctrlKey: true,
      deltaY: -100,
    });

    expect(onViewportChange).toHaveBeenLastCalledWith({
      x: 0,
      y: 0,
      zoom: 1.1,
    });
  });

  it("pans with arrow keys", () => {
    const onViewportChange = vi.fn();

    render(<CanvasView onViewportChange={onViewportChange} />);

    const viewport = screen.getByRole("button", {
      name: "Canvas workspace",
    });
    viewport.focus();
    fireEvent.keyDown(viewport, { key: "ArrowRight" });

    expect(onViewportChange).toHaveBeenLastCalledWith({
      x: -40,
      y: 0,
      zoom: 1,
    });
  });

  it("prevents text selection on the interaction layer", () => {
    render(<CanvasView />);

    expect(
      screen.getByRole("button", { name: "Canvas workspace" }),
    ).toHaveClass("select-none");
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

    const viewport = screen.getByRole("button", {
      name: "Canvas workspace",
    });
    viewport.focus();
    fireEvent.keyDown(viewport, { key: "0" });

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
});
