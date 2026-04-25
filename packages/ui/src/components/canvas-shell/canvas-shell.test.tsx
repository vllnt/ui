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
    shell.querySelector('[data-slot="canvas-shell-content"]'),
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

  it("keeps legacy slot props on the legacy layout path", () => {
    const { container } = render(
      <CanvasShell
        bottomSlot={<div>Legacy bottom</div>}
        leftRail={<div>Legacy left</div>}
        rightDock={<div>Legacy right</div>}
        topBar={<div>Legacy top</div>}
      >
        <div>Legacy main</div>
      </CanvasShell>,
    );

    const shell = getElement(container.firstElementChild, "legacy shell");
    const grid = getElement(shell.children.item(1), "legacy grid");
    const bottomHost = getElement(shell.children.item(2), "legacy bottom host");

    expect(shell.className).toContain("flex-col");
    expect(shell.className).not.toContain("relative isolate");
    expect(grid.className).toContain("grid-cols-[auto_minmax(0,1fr)_auto]");
    expect(bottomHost.className).toContain("border-t");
    expect(screen.getByText("Legacy top")).toBeInTheDocument();
    expect(screen.getByText("Legacy left")).toBeInTheDocument();
    expect(screen.getByText("Legacy right")).toBeInTheDocument();
    expect(screen.getByText("Legacy bottom")).toBeInTheDocument();
    expect(screen.getByText("Legacy main")).toBeInTheDocument();
  });

  it("keeps the legacy layout when new chrome props are null", () => {
    const { container } = render(
      <CanvasShell
        bottomBar={null}
        leftBar={null}
        rightBar={null}
        topBar={<div>Legacy top</div>}
      >
        <div>Legacy main</div>
      </CanvasShell>,
    );

    const shell = getElement(container.firstElementChild, "legacy shell");

    expect(shell.className).toContain("flex-col");
    expect(shell.className).not.toContain("relative isolate");
    expect(screen.getByText("Legacy top")).toBeInTheDocument();
    expect(screen.getByText("Legacy main")).toBeInTheDocument();
  });

  it("treats an explicit chromeInset as floating-mode intent", () => {
    const { container } = render(
      <CanvasShell chromeInset={16}>
        <div>Inset main</div>
      </CanvasShell>,
    );

    const { shell } = getShellElements(container);

    expect(shell.className).toContain("relative isolate flex");
    expect(shell.getAttribute("style")).toContain(
      "--canvas-shell-safe-top: 16px",
    );
    expect(screen.getByText("Inset main")).toBeInTheDocument();
  });

  it("keeps falsey chrome props on the legacy layout path", () => {
    const { container } = render(
      <CanvasShell bottomBar={false} leftBar={0} rightBar="">
        <div>Falsey main</div>
      </CanvasShell>,
    );

    const shell = getElement(container.firstElementChild, "legacy shell");

    expect(shell.className).toContain("flex-col");
    expect(shell.className).not.toContain("relative isolate");
    expect(screen.getByText("Falsey main")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("keeps floating chrome aligned with legacy document order", () => {
    render(
      <CanvasShell
        bottomBar={<button type="button">Bottom action</button>}
        leftBar={<button type="button">Left action</button>}
        rightBar={<button type="button">Right action</button>}
        topBar={<button type="button">Top action</button>}
      >
        <button type="button">Main action</button>
      </CanvasShell>,
    );

    const topAction = screen.getByRole("button", { name: "Top action" });
    const mainAction = screen.getByRole("button", { name: "Main action" });
    const rightAction = screen.getByRole("button", { name: "Right action" });
    const bottomAction = screen.getByRole("button", { name: "Bottom action" });

    expect(
      topAction.compareDocumentPosition(mainAction) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      mainAction.compareDocumentPosition(rightAction) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      mainAction.compareDocumentPosition(bottomAction) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
