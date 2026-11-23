import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RunTimeline, type RunTimelinePhase } from "./run-timeline";

const sample: RunTimelinePhase[] = [
  {
    end: 600,
    id: "1",
    label: "load",
    laneId: "ingest",
    start: 0,
    state: "complete",
  },
  {
    end: 2400,
    id: "2",
    label: "score",
    laneId: "rank",
    start: 600,
    state: "running",
  },
];

const lanes = [
  { id: "ingest", label: "Ingest" },
  { id: "rank", label: "Rank" },
];

describe("RunTimeline", () => {
  it("renders the empty state when no phases are provided", () => {
    const { container } = render(
      <RunTimeline end={100} phases={[]} start={0} />,
    );
    expect(
      container.querySelector("[data-run-timeline-state='empty']"),
    ).toBeInTheDocument();
  });

  it("renders one plain phase bar per phase routed to its lane, plus the cursor", () => {
    const { container } = render(
      <RunTimeline
        cursor={1800}
        end={3600}
        lanes={lanes}
        phases={sample}
        start={0}
      />,
    );
    expect(container.querySelectorAll("[data-run-phase]")).toHaveLength(2);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      container.querySelector("[data-run-timeline-cursor]"),
    ).toBeInTheDocument();
  });

  it("invokes onActivate when an interactive phase is clicked", () => {
    const handleActivate = vi.fn();
    render(
      <RunTimeline
        end={100}
        phases={[
          {
            end: 50,
            id: "x",
            label: "click",
            onActivate: handleActivate,
            start: 0,
          },
        ]}
        start={0}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("falls back to a single 'Run' lane when lanes prop is omitted", () => {
    const { container } = render(
      <RunTimeline
        end={100}
        phases={[{ end: 50, id: "p", label: "go", start: 0, state: "running" }]}
        start={0}
      />,
    );
    expect(
      container.querySelector("[data-run-timeline-lane='default']"),
    ).toBeInTheDocument();
  });

  it("applies the formatValue callback to endpoints + cursor", () => {
    render(
      <RunTimeline
        cursor={1800}
        end={3600}
        formatValue={(v) => `${v / 60}m`}
        phases={sample}
        start={0}
      />,
    );
    expect(screen.getByText("0m")).toBeInTheDocument();
    expect(screen.getByText("60m")).toBeInTheDocument();
    expect(screen.getByText("30m")).toBeInTheDocument();
  });

  it("falls back to a 1-unit span when end is not greater than start", () => {
    const { container } = render(
      <RunTimeline
        end={5}
        phases={[{ end: 5, id: "p", label: "go", start: 5, state: "running" }]}
        start={5}
      />,
    );
    expect(container.querySelector("[data-run-phase='p']")).toBeInTheDocument();
  });
});

describe("RunTimeline target size and contrast", () => {
  it("keeps clickable phases at least 24px wide and darkens the queued fill in dark mode", () => {
    render(
      <RunTimeline
        end={3600}
        lanes={lanes}
        phases={[
          { ...sample[0], end: 20, onActivate: vi.fn() },
          { ...sample[1], onActivate: vi.fn(), state: "queued" },
        ]}
        start={0}
      />,
    );
    expect(screen.getByRole("button", { name: /^Complete/ })).toHaveClass(
      "min-w-6",
    );
    expect(screen.getByRole("button", { name: /^Queued/ })).toHaveClass(
      "dark:bg-amber-600/70",
    );
  });
});

describe("RunTimeline phase names", () => {
  it("keeps the visible label inside the accessible name (WCAG 2.5.3)", () => {
    render(
      <RunTimeline
        end={100}
        phases={[
          {
            end: 40,
            id: "a",
            label: "Ingest",
            onActivate: vi.fn(),
            start: 0,
            state: "complete",
          },
          { end: 90, id: "b", label: "Train", start: 40, state: "queued" },
        ]}
        start={0}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Complete 0 → 40: Ingest" }),
    ).toBeInTheDocument();
    const passive = document.querySelector("[data-run-phase='b']");
    expect(passive).not.toHaveAttribute("aria-label");
    expect(passive).toHaveTextContent("Queued 40 → 90: Train");
  });
});
