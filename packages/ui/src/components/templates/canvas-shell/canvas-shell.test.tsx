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

function expectLegacyShell(container: HTMLElement) {
  const shell = getElement(container.firstElementChild, "legacy shell");
  expect(shell.className).toContain("flex-col");
  expect(shell.className).not.toContain("relative isolate");
  return shell;
}

const floatingSafeArea = [
  "--canvas-shell-safe-right: calc(16px + 18rem)",
  "--canvas-shell-safe-bottom: calc(16px + 3.5rem)",
  "--canvas-shell-safe-left: calc(16px + 4.5rem)",
];

const action = (name: string) =>
  screen.getByRole("button", { name: `${name} action` });

describe("CanvasShell", () => {
  it("renders all regions and reserves default chrome footprint in floating mode", () => {
    const { container } = render(
      <CanvasShell
        bottomBar={<div>bottom host</div>}
        leftBar={<div>left rail</div>}
        rightBar={<div>right dock</div>}
        topBar={<div>top bar</div>}
      >
        <div>main view</div>
      </CanvasShell>,
    );
    ["top bar", "left rail", "main view", "right dock", "bottom host"].forEach(
      (text) => {
        expect(screen.getByText(text)).toBeInTheDocument();
      },
    );
    const shellStyle = getShellElements(container).shell.getAttribute("style");
    expect(shellStyle).toContain(
      "--canvas-shell-safe-top: calc(16px + 3.5rem)",
    );
    floatingSafeArea.forEach((variable) => {
      expect(shellStyle).toContain(variable);
    });
    expect(shellStyle).not.toContain("112px");
    expect(shellStyle).not.toContain("392px");
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
    (
      [
        ["top", 77],
        ["right", 55],
        ["bottom", 88],
        ["left", 44],
      ] as const
    ).forEach(([side, px]) => {
      expect(shell.getAttribute("style")).toContain(
        `--canvas-shell-safe-${side}: ${px}px`,
      );
      expect(contentHost.getAttribute("style")).toContain(
        `padding-${side}: var(--canvas-shell-safe-${side})`,
      );
    });
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
    const shell = expectLegacyShell(container);
    const grid = getElement(shell.children.item(1), "legacy grid");
    const bottomHost = getElement(shell.children.item(2), "legacy bottom host");
    expect(grid.className).toContain("grid-cols-[auto_minmax(0,1fr)_auto]");
    expect(bottomHost.className).toContain("border-t");
    ["top", "left", "right", "bottom", "main"].forEach((text) => {
      expect(screen.getByText(`Legacy ${text}`)).toBeInTheDocument();
    });
  });

  it.each([
    {
      name: "new chrome props are null",
      props: { bottomBar: null, leftBar: null, rightBar: null },
    },
    {
      name: "chromeInset is explicitly undefined",
      props: { chromeInset: undefined },
    },
  ])("keeps the legacy layout when $name", ({ props }) => {
    const { container } = render(
      <CanvasShell {...props} topBar={<div>Legacy top</div>}>
        <div>Legacy main</div>
      </CanvasShell>,
    );
    expectLegacyShell(container);
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
    expectLegacyShell(container);
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
    (
      [
        ["Top", "Main"],
        ["Main", "Right"],
        ["Main", "Bottom"],
      ] as const
    ).forEach(([before, after]) => {
      expect(
        action(before).compareDocumentPosition(action(after)) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
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
    const shellStyle = shell.getAttribute("style");
    expect(shell.className).toContain("relative isolate flex");
    expect(shellStyle).toContain("--canvas-shell-safe-top: 24px");
    floatingSafeArea.forEach((variable) => {
      expect(shellStyle).toContain(variable);
    });
    ["top", "left", "right", "bottom", "main"].forEach((text) => {
      expect(screen.getByText(`legacy ${text}`)).toBeInTheDocument();
    });
  });
});
