import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CanvasShell } from "./canvas-shell";

describe("CanvasShell", () => {
  it("renders top, left, main, right, and bottom regions", () => {
    render(
      <CanvasShell
        bottomBar={<div>bottom host</div>}
        leftBar={<div>left rail</div>}
        rightBar={<div>right dock</div>}
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

  it("exposes safe-area CSS vars for content spacing", () => {
    const { container } = render(
      <CanvasShell
        contentPadding={{ bottom: 88, left: 44, right: 55, top: 77 }}
      >
        <div>spaced main</div>
      </CanvasShell>,
    );

    const shell = container.firstElementChild as HTMLElement | null;
    const contentHost = shell?.children.item(1) as HTMLElement | null;

    expect(shell).not.toBeNull();
    expect(shell?.getAttribute("style")).toContain(
      "--canvas-shell-safe-top: 77px",
    );
    expect(shell?.getAttribute("style")).toContain(
      "--canvas-shell-safe-right: 55px",
    );
    expect(shell?.getAttribute("style")).toContain(
      "--canvas-shell-safe-bottom: 88px",
    );
    expect(shell?.getAttribute("style")).toContain(
      "--canvas-shell-safe-left: 44px",
    );
    expect(contentHost?.getAttribute("style")).toContain(
      "padding-top: var(--canvas-shell-safe-top)",
    );
    expect(contentHost?.getAttribute("style")).toContain(
      "padding-right: var(--canvas-shell-safe-right)",
    );
    expect(contentHost?.getAttribute("style")).toContain(
      "padding-bottom: var(--canvas-shell-safe-bottom)",
    );
    expect(contentHost?.getAttribute("style")).toContain(
      "padding-left: var(--canvas-shell-safe-left)",
    );
  });

  it("keeps legacy slot props working", () => {
    render(
      <CanvasShell
        bottomSlot={<div>legacy bottom</div>}
        leftRail={<div>legacy left</div>}
        rightDock={<div>legacy right</div>}
      >
        <div>legacy main</div>
      </CanvasShell>,
    );

    expect(screen.getByText("legacy left")).toBeInTheDocument();
    expect(screen.getByText("legacy right")).toBeInTheDocument();
    expect(screen.getByText("legacy bottom")).toBeInTheDocument();
  });
});
