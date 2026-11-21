import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  CommandDock as BarrelCommandDock,
  JarvisDock,
  type JarvisDockProps,
} from "../../index";

import { CommandDock, type CommandDockAction } from "./command-dock";

const buildActions = (
  overrides: Partial<CommandDockAction> = {},
): CommandDockAction[] => [
  {
    glyph: "+",
    id: "summon",
    label: "Summon",
    onActivate: vi.fn(),
    tone: "primary",
    ...overrides,
  },
  {
    glyph: "✓",
    id: "review",
    label: "Review",
    onActivate: vi.fn(),
    tone: "success",
  },
];

describe("CommandDock", () => {
  it("renders labelled buttons and the palette trigger only when onOpenPalette is provided", () => {
    const { container, rerender } = render(
      <CommandDock actions={buildActions()} />,
    );
    expect(screen.getByText("Summon")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(
      container.querySelector("[data-command-palette-trigger]"),
    ).not.toBeInTheDocument();
    rerender(<CommandDock actions={buildActions()} onOpenPalette={vi.fn()} />);
    expect(
      container.querySelector("[data-command-palette-trigger]"),
    ).toBeInTheDocument();
  });

  it("invokes onActivate for an untoned action and renders its badge", () => {
    const handleActivate = vi.fn();
    render(
      <CommandDock
        actions={[
          {
            badge: "3",
            glyph: "+",
            id: "summon",
            label: "Summon",
            onActivate: handleActivate,
          },
        ]}
      />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Summon"));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("invokes onOpenPalette when the palette trigger is clicked", () => {
    const handleOpen = vi.fn();
    render(<CommandDock actions={buildActions()} onOpenPalette={handleOpen} />);
    fireEvent.click(screen.getByLabelText("Open command palette"));
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});

describe("JarvisDock (deprecated alias of CommandDock)", () => {
  it("is the same component, exported from the package barrel", () => {
    expect(JarvisDock).toBe(CommandDock);
    expect(BarrelCommandDock).toBe(CommandDock);
  });

  it("renders the same markup as CommandDock, and its props type is the CommandDock one", () => {
    const props: JarvisDockProps = {
      actions: buildActions(),
      onOpenPalette: vi.fn(),
    };
    const current = render(<CommandDock {...props} />);
    const deprecated = render(<JarvisDock {...props} />);
    expect(deprecated.container.innerHTML).toBe(current.container.innerHTML);
    expect(screen.getAllByLabelText("Command dock")).toHaveLength(2);
  });
});
