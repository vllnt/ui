import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { GanttChart, type GanttGroup } from "./gantt-chart";

const GROUPS: GanttGroup[] = [
  {
    id: "phase-1",
    name: "Phase 1",
    tasks: [
      {
        color: "blue",
        end: "2026-02-28",
        id: "design",
        progress: 100,
        start: "2026-01-15",
        title: "Design system",
      },
      {
        color: "emerald",
        end: "2026-04-15",
        id: "core",
        progress: 65,
        start: "2026-02-01",
        title: "Core components",
      },
    ],
  },
];

function renderChart(props: Partial<ComponentProps<typeof GanttChart>> = {}) {
  return render(
    <GanttChart
      endDate="2026-06-30"
      groups={GROUPS}
      startDate="2026-01-01"
      {...props}
    />,
  );
}

describe("GanttChart", () => {
  it("renders the group, task titles, per-bar ids, in-range milestones, and the today line", () => {
    const { container } = renderChart({
      milestones: [{ date: "2026-04-15", id: "v1", title: "v1.0" }],
      now: "2026-03-01",
    });
    expect(screen.getByText("Phase 1")).toBeInTheDocument();
    expect(screen.getByText("Design system")).toBeInTheDocument();
    expect(screen.getByText("Core components")).toBeInTheDocument();
    expect(screen.getByText("v1.0")).toBeInTheDocument();
    const bars = container.querySelectorAll("[data-task-id]");
    expect(bars.length).toBe(2);
    expect(bars[0]).toHaveAttribute("data-task-id", "design");
    expect(bars[1]).toHaveAttribute("data-task-id", "core");
    expect(screen.getByLabelText("Milestone: v1.0")).toBeInTheDocument();
    expect(screen.getByLabelText("Today")).toBeInTheDocument();
  });

  it("renders the assignee and a progressbar with clamped aria values", () => {
    renderChart({
      groups: [
        {
          id: "single",
          name: "Single",
          tasks: [
            {
              end: "2026-02-15",
              id: "task",
              progress: 150,
              start: "2026-01-15",
              title: "Edge",
            },
            {
              assignee: "Alice",
              end: "2026-02-15",
              id: "owned",
              start: "2026-01-15",
              title: "Design",
            },
          ],
        },
      ],
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(2);
    expect(bars[0]).toHaveAttribute("aria-valuenow", "100");
    expect(bars[0]).toHaveAttribute("aria-valuemin", "0");
    expect(bars[0]).toHaveAttribute("aria-valuemax", "100");
  });

  it("hides out-of-range milestones and today line", () => {
    const { container } = renderChart({
      milestones: [{ date: "2027-01-01", id: "future", title: "Future" }],
      now: "2027-01-01",
    });
    expect(container.querySelector("[data-milestone-id]")).toBeNull();
    expect(screen.queryByLabelText("Today")).not.toBeInTheDocument();
  });

  it("renders quarter ticks for scale=quarter", () => {
    renderChart({ endDate: "2026-12-31", scale: "quarter" });
    expect(screen.getByText("Q1 2026")).toBeInTheDocument();
  });
});

describe("GanttChart accessibility", () => {
  it("is a named, focusable scrolling region", () => {
    renderChart({ labels: { region: "Roadmap" } });
    expect(screen.getByRole("region", { name: "Roadmap" })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("defaults the region name and keeps the today caption on a 10% tint", () => {
    renderChart({ now: "2026-03-01" });
    expect(
      screen.getByRole("region", { name: "Gantt chart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Today")).toHaveClass("bg-destructive/10");
  });
});
