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
  it("renders labelled buttons and the palette trigger only when onOpenPalette is provided", () => {
    const { container, rerender } = render(
      <JarvisDock actions={buildActions()} />,
    );
    expect(screen.getByText("Summon")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(
      container.querySelector("[data-jarvis-palette-trigger]"),
    ).not.toBeInTheDocument();
    rerender(<JarvisDock actions={buildActions()} onOpenPalette={vi.fn()} />);
    expect(
      container.querySelector("[data-jarvis-palette-trigger]"),
    ).toBeInTheDocument();
  });

  it("invokes onActivate for an untoned action and renders its badge", () => {
    const handleActivate = vi.fn();
    render(
      <JarvisDock
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
    render(<JarvisDock actions={buildActions()} onOpenPalette={handleOpen} />);
    fireEvent.click(screen.getByLabelText("Open command palette"));
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
