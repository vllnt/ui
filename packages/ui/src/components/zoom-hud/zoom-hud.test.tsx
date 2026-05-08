import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ZoomHUD } from "./zoom-hud";

describe("ZoomHUD", () => {
  it("renders the zoom percentage", () => {
    render(<ZoomHUD zoom={1.42} />);

    expect(screen.getByText("142%")).toBeInTheDocument();
  });

  it("invokes onZoomIn when the zoom-in button is clicked", () => {
    const onZoomIn = vi.fn();
    render(<ZoomHUD onZoomIn={onZoomIn} zoom={1} />);

    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(onZoomIn).toHaveBeenCalledTimes(1);
  });

  it("invokes onZoomOut when the zoom-out button is clicked", () => {
    const onZoomOut = vi.fn();
    render(<ZoomHUD onZoomOut={onZoomOut} zoom={1} />);

    fireEvent.click(screen.getByLabelText("Zoom out"));
    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });

  it("invokes onReset when the reset button is clicked", () => {
    const onReset = vi.fn();
    render(<ZoomHUD onReset={onReset} zoom={1} />);

    fireEvent.click(screen.getByLabelText("Reset zoom"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("rounds the zoom to the nearest percent", () => {
    render(<ZoomHUD zoom={0.755} />);

    expect(screen.getByText("76%")).toBeInTheDocument();
  });
});
