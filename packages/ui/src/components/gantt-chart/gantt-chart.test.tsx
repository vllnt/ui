import { render, screen } from "@testing-library/react";
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

describe("GanttChart", () => {
  describe("rendering", () => {
    it("renders the group name and task titles", () => {
      render(
        <GanttChart
          endDate="2026-06-30"
          groups={GROUPS}
          startDate="2026-01-01"
        />,
      );

      expect(screen.getByText("Phase 1")).toBeInTheDocument();
      expect(screen.getByText("Design system")).toBeInTheDocument();
      expect(screen.getByText("Core components")).toBeInTheDocument();
    });

    it("emits data-task-id per bar", () => {
      const { container } = render(
        <GanttChart
          endDate="2026-06-30"
          groups={GROUPS}
          startDate="2026-01-01"
        />,
      );

      const bars = container.querySelectorAll("[data-task-id]");
      expect(bars.length).toBe(2);
      expect(bars[0]).toHaveAttribute("data-task-id", "design");
      expect(bars[1]).toHaveAttribute("data-task-id", "core");
    });

    it("renders progress bars with role=progressbar and clamped aria values", () => {
      render(
        <GanttChart
          endDate="2026-06-30"
          groups={[
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
              ],
            },
          ]}
          startDate="2026-01-01"
        />,
      );

      const bars = screen.getAllByRole("progressbar");
      expect(bars).toHaveLength(1);
      expect(bars[0]).toHaveAttribute("aria-valuenow", "100");
      expect(bars[0]).toHaveAttribute("aria-valuemin", "0");
      expect(bars[0]).toHaveAttribute("aria-valuemax", "100");
    });

    it("renders the assignee label when provided", () => {
      render(
        <GanttChart
          endDate="2026-06-30"
          groups={[
            {
              id: "single",
              name: "Single",
              tasks: [
                {
                  assignee: "Alice",
                  end: "2026-02-15",
                  id: "task",
                  start: "2026-01-15",
                  title: "Design",
                },
              ],
            },
          ]}
          startDate="2026-01-01"
        />,
      );

      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });

  describe("milestones", () => {
    it("renders milestones in range", () => {
      render(
        <GanttChart
          endDate="2026-06-30"
          groups={GROUPS}
          milestones={[{ date: "2026-04-15", id: "v1", title: "v1.0" }]}
          startDate="2026-01-01"
        />,
      );

      expect(screen.getByLabelText("Milestone: v1.0")).toBeInTheDocument();
      expect(screen.getByText("v1.0")).toBeInTheDocument();
    });

    it("hides milestones outside the visible range", () => {
      const { container } = render(
        <GanttChart
          endDate="2026-06-30"
          groups={GROUPS}
          milestones={[{ date: "2027-01-01", id: "future", title: "Future" }]}
          startDate="2026-01-01"
        />,
      );

      expect(container.querySelector("[data-milestone-id]")).toBeNull();
    });
  });

  describe("today line", () => {
    it("renders the today line when within range", () => {
      render(
        <GanttChart
          endDate="2026-06-30"
          groups={GROUPS}
          now="2026-03-01"
          startDate="2026-01-01"
        />,
      );

      expect(screen.getByLabelText("Today")).toBeInTheDocument();
    });

    it("hides the today line when outside the range", () => {
      render(
        <GanttChart
          endDate="2026-06-30"
          groups={GROUPS}
          now="2027-01-01"
          startDate="2026-01-01"
        />,
      );

      expect(screen.queryByLabelText("Today")).not.toBeInTheDocument();
    });
  });

  describe("scale", () => {
    it("renders quarter ticks for scale=quarter", () => {
      render(
        <GanttChart
          endDate="2026-12-31"
          groups={GROUPS}
          scale="quarter"
          startDate="2026-01-01"
        />,
      );

      expect(screen.getByText("Q1 2026")).toBeInTheDocument();
    });
  });
});
