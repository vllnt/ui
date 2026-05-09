import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JarvisDock, type JarvisDockAction } from "./jarvis-dock";

const buildActions = (
  overrides: Partial<JarvisDockAction> = {},
): JarvisDockAction[] => [
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

describe("JarvisDock", () => {
  it("renders one button per action with the label", () => {
    const actions = buildActions();
    render(<JarvisDock actions={actions} />);

    expect(screen.getByText("Summon")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("invokes onActivate when an action is clicked", () => {
    const handleActivate = vi.fn();
    render(
      <JarvisDock
        actions={[
          {
            glyph: "+",
            id: "summon",
            label: "Summon",
            onActivate: handleActivate,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("Summon"));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("renders the palette trigger only when onOpenPalette is provided", () => {
    const { container, rerender } = render(
      <JarvisDock actions={buildActions()} />,
    );

    expect(
      container.querySelector("[data-jarvis-palette-trigger]"),
    ).not.toBeInTheDocument();

    rerender(<JarvisDock actions={buildActions()} onOpenPalette={vi.fn()} />);
    expect(
      container.querySelector("[data-jarvis-palette-trigger]"),
    ).toBeInTheDocument();
  });

  it("invokes onOpenPalette when the palette trigger is clicked", () => {
    const handleOpen = vi.fn();
    render(<JarvisDock actions={buildActions()} onOpenPalette={handleOpen} />);

    fireEvent.click(screen.getByLabelText("Open command palette"));
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it("renders the badge when provided", () => {
    render(
      <JarvisDock
        actions={[
          {
            badge: "3",
            glyph: "+",
            id: "summon",
            label: "Summon",
            onActivate: vi.fn(),
          },
        ]}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
