import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CanvasShell } from "./canvas-shell";

describe("CanvasShell", () => {
  it("renders top, left, main, right, and bottom regions", () => {
    render(
      <CanvasShell
        bottomSlot={<div>bottom host</div>}
        leftRail={<div>left rail</div>}
        rightDock={<div>right dock</div>}
        topBar={<div>top bar</div>}
      >
        <div>main view</div>
      </CanvasShell>,
    );

    expect(screen.getByText("top bar")).toBeInTheDocument();
    expect(screen.getByText("left rail")).toBeInTheDocument();
    expect(screen.getByText("main view")).toBeInTheDocument();
    expect(screen.getByText("right dock")).toBeInTheDocument();
    expect(screen.getByText("bottom host")).toBeInTheDocument();
  });
});
