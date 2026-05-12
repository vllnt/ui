import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  TableOfContentsPanel,
  type TOCSection,
} from "./table-of-contents-panel";

const sections: TOCSection[] = [
  { id: "intro", title: "Introduction" },
  { id: "deep-dive", title: "Deep dive" },
];

const baseProps = {
  completedSections: new Set<string>(["intro"]),
  completionCount: 1,
  currentSectionIndex: 0,
  isOpen: true,
  onClose: vi.fn(),
  onSelectSection: vi.fn(),
  sections,
  totalSections: 2,
};

describe("TableOfContentsPanel", () => {
  it("renders nothing when closed", () => {
    render(<TableOfContentsPanel {...baseProps} isOpen={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog with progress and sections when open", () => {
    render(<TableOfContentsPanel {...baseProps} />);

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Table of Contents")).toBeInTheDocument();
    expect(screen.getByText("1 / 2 (50%)")).toBeInTheDocument();
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Deep dive")).toBeInTheDocument();
  });

  it("selects a section and closes the panel", () => {
    const handleClose = vi.fn();
    const handleSelectSection = vi.fn();
    render(
      <TableOfContentsPanel
        {...baseProps}
        onClose={handleClose}
        onSelectSection={handleSelectSection}
      />,
    );

    fireEvent.click(screen.getByText("Deep dive"));

    expect(handleSelectSection).toHaveBeenCalledWith(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape and backdrop click", () => {
    const handleClose = vi.fn();
    const { container } = render(
      <TableOfContentsPanel {...baseProps} onClose={handleClose} />,
    );
    const backdrop = container.querySelector<HTMLElement>(
      "[aria-hidden='true']",
    );
    if (!backdrop) throw new Error("Expected backdrop to render");

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it("renders the reset action only when progress exists", () => {
    const handleReset = vi.fn();
    const { rerender } = render(
      <TableOfContentsPanel {...baseProps} onReset={handleReset} />,
    );

    fireEvent.click(screen.getByText("Reset Progress"));
    expect(handleReset).toHaveBeenCalledTimes(1);

    rerender(
      <TableOfContentsPanel
        {...baseProps}
        completionCount={0}
        onReset={handleReset}
      />,
    );
    expect(screen.queryByText("Reset Progress")).not.toBeInTheDocument();
  });
});
