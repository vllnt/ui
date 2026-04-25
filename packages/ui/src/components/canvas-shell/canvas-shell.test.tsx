import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CanvasShell } from "./canvas-shell";

function getElement(node: Element | null, label: string) {
  expect(node).toBeInstanceOf(HTMLElement);

  if (!(node instanceof HTMLElement)) {
    throw new TypeError(`${label} not found`);
  }

  return node;
}

function getShellElements(container: HTMLElement) {
  const shell = getElement(container.firstElementChild, "CanvasShell shell");
  const contentHost = getElement(
    shell.children.item(1),
    "CanvasShell content host",
  );

  return { contentHost, shell };
}

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

    const { contentHost, shell } = getShellElements(container);

    expect(shell.getAttribute("style")).toContain(
      "--canvas-shell-safe-top: 77px",
    );
    expect(shell.getAttribute("style")).toContain(
      "--canvas-shell-safe-right: 55px",
    );
    expect(shell.getAttribute("style")).toContain(
      "--canvas-shell-safe-bottom: 88px",
    );
    expect(shell.getAttribute("style")).toContain(
      "--canvas-shell-safe-left: 44px",
    );
    expect(contentHost.getAttribute("style")).toContain(
      "padding-top: var(--canvas-shell-safe-top)",
    );
    expect(contentHost.getAttribute("style")).toContain(
      "padding-right: var(--canvas-shell-safe-right)",
    );
    expect(contentHost.getAttribute("style")).toContain(
      "padding-bottom: var(--canvas-shell-safe-bottom)",
    );
    expect(contentHost.getAttribute("style")).toContain(
      "padding-left: var(--canvas-shell-safe-left)",
    );
  });

  it("defaults floating safe-area spacing to the chrome inset instead of magic values", () => {
    const { container } = render(
      <CanvasShell
        bottomBar={<div>bottom host</div>}
        leftBar={<div>left rail</div>}
        rightBar={<div>right dock</div>}
        topBar={<div>top bar</div>}
      >
        <div>floating main</div>
      </CanvasShell>,
    );

    const { shell } = getShellElements(container);
    const shellStyle = shell.getAttribute("style");

    expect(shellStyle).toContain("--canvas-shell-safe-top: 16px");
    expect(shellStyle).toContain("--canvas-shell-safe-right: 16px");
    expect(shellStyle).toContain("--canvas-shell-safe-bottom: 16px");
    expect(shellStyle).toContain("--canvas-shell-safe-left: 16px");
    expect(shellStyle).not.toContain("112px");
    expect(shellStyle).not.toContain("392px");
  });

  it("preserves deprecated side slots during floating migrations", () => {
    const { container } = render(
      <CanvasShell
        bottomSlot={<div>legacy bottom</div>}
        contentPadding={{ top: 24 }}
        leftRail={<div>legacy left</div>}
        rightDock={<div>legacy right</div>}
        topBar={<div>legacy top</div>}
      >
        <div>legacy main</div>
      </CanvasShell>,
    );

    const { shell } = getShellElements(container);

    expect(shell.className).toContain("relative isolate flex");
    expect(screen.getByText("legacy top")).toBeInTheDocument();
    expect(screen.getByText("legacy left")).toBeInTheDocument();
    expect(screen.getByText("legacy right")).toBeInTheDocument();
    expect(screen.getByText("legacy bottom")).toBeInTheDocument();
    expect(screen.getByText("legacy main")).toBeInTheDocument();
  });
});
