import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TLDRSection } from "./tldr-section";

describe("TLDRSection", () => {
  it("renders the label, starts collapsed, and keeps the label after expanding", () => {
    render(
      <TLDRSection label="TLDR">
        <p>Body content</p>
      </TLDRSection>,
    );
    expect(screen.getByText("TLDR")).toBeInTheDocument();
    expect(screen.queryByText("Body content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("TLDR"));
    expect(screen.getByText("TLDR")).toBeInTheDocument();
  });

  // Regression: we moved the skeleton state from cascading setState in an
  // effect to a useReducer (react-doctor no-cascading-set-state). This locks in
  // the show -> hide transition the reducer drives on first expand.
  it("shows the skeleton on first expand, then reveals content after the load delay", () => {
    vi.useFakeTimers();
    try {
      render(
        <TLDRSection label="TLDR">
          <p>Body content</p>
        </TLDRSection>,
      );
      act(() => {
        fireEvent.click(screen.getByText("TLDR"));
      });
      // requestAnimationFrame dispatches "show" -> skeleton replaces content.
      act(() => {
        vi.advanceTimersByTime(32);
      });
      expect(screen.queryByText("Body content")).not.toBeInTheDocument();
      // The 800ms timer dispatches "hide" -> content appears.
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(screen.getByText("Body content")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
