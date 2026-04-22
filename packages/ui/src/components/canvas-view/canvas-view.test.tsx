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
});
