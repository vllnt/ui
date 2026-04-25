import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CHECKLIST_PROGRESS_EVENT } from "../checklist";

import {
  ProgressTracker,
  ProgressTrackerBadge,
  ProgressTrackerModule,
  ProgressTrackerModules,
  ProgressTrackerOverview,
  ProgressTrackerStat,
  ProgressTrackerStats,
} from "./progress-tracker";

const modules = [
  {
    badge: "Core",
    completedExercises: 18,
    completedLessons: 12,
    currentLesson: "Review quiz",
    exercises: 18,
    lessons: 12,
    progress: 1,
    skills: ["Syntax", "Variables"],
    status: "completed" as const,
    title: "JavaScript Basics",
  },
  {
    badge: "Active",
    completedExercises: 4,
    completedLessons: 3,
    currentLesson: "Hooks in action",
    exercises: 10,
    lessons: 8,
    progress: 0.4,
    skills: ["Components", "Hooks"],
    status: "in-progress" as const,
    timeSpent: "6h 20m",
    title: "React Fundamentals",
  },
];

afterEach(() => {
  localStorage.clear();
});

describe("ProgressTracker", () => {
  it("renders overview metrics and top-level title", () => {
    render(
      <ProgressTracker modules={modules} overallProgress={0.65} streak={7}>
        <ProgressTrackerOverview />
      </ProgressTracker>,
    );

    expect(screen.getByText("Learning progress")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: /overall progress/i }),
    ).toHaveAttribute("aria-valuenow", "65");
    expect(screen.getByText("15/20")).toBeVisible();
    expect(screen.getByText("22/28")).toBeVisible();
  });

  it("renders modules with progress semantics and status labels", () => {
    const [firstModule, secondModule] = modules;

    if (!firstModule || !secondModule) {
      throw new Error("Expected seeded modules for this test");
    }

    render(
      <ProgressTracker modules={modules} overallProgress={65} streak={7}>
        <ProgressTrackerModules>
          <ProgressTrackerModule {...firstModule} />
          <ProgressTrackerModule {...secondModule} />
        </ProgressTrackerModules>
      </ProgressTracker>,
    );

    expect(screen.getByText("Completed")).toBeVisible();
    expect(screen.getByText("In progress")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: /react fundamentals progress/i }),
    ).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("Current: Hooks in action")).toBeVisible();
    expect(screen.getByText("Hooks")).toBeVisible();
  });

  it("uses Checklist persistence when checklist items and a persist key are provided", () => {
    localStorage.setItem(
      "checklist:react-fundamentals",
      JSON.stringify(["intro", "components", "hooks"]),
    );

    render(
      <ProgressTracker modules={modules} overallProgress={65} streak={7}>
        <ProgressTrackerModules>
          <ProgressTrackerModule
            checklistItems={[
              { id: "intro", label: "Intro" },
              { id: "components", label: "Components" },
              { id: "hooks", label: "Hooks" },
              { id: "state", label: "State" },
            ]}
            completedLessons={0}
            lessons={4}
            persistKey="react-fundamentals"
            progress={0}
            status="in-progress"
            title="Checklist-backed module"
          />
        </ProgressTrackerModules>
      </ProgressTracker>,
    );

    expect(
      screen.getByRole("progressbar", {
        name: /checklist-backed module progress/i,
      }),
    ).toHaveAttribute("aria-valuenow", "75");
    expect(screen.getByText("3/4")).toBeVisible();
  });

  it("renders stat cards and custom badges", () => {
    render(
      <ProgressTracker modules={modules} overallProgress={0.65} streak={7}>
        <ProgressTrackerStats>
          <ProgressTrackerStat label="Time Spent" value="24h" />
          <ProgressTrackerStat label="Exercises" value="45/80" />
        </ProgressTrackerStats>
        <ProgressTrackerBadge>Consistency</ProgressTrackerBadge>
      </ProgressTracker>,
    );

    expect(screen.getByText("Time Spent")).toBeVisible();
    expect(screen.getByText("24h")).toBeVisible();
    expect(screen.getByText("Consistency")).toBeVisible();
  });

  it("keeps locked modules non-interactive even when href is provided", () => {
    render(
      <ProgressTracker modules={modules} overallProgress={65} streak={7}>
        <ProgressTrackerModules>
          <ProgressTrackerModule
            href="/learning/locked"
            lessons={4}
            progress={0}
            status="locked"
            title="Locked module"
          />
        </ProgressTrackerModules>
      </ProgressTracker>,
    );

    expect(
      screen.queryByRole("link", { name: /locked module/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Locked module")).toBeVisible();
  });

  it("updates overview totals and module progress from same-tab checklist persistence events", () => {
    render(
      <ProgressTracker
        modules={[
          {
            checklistItems: [
              { id: "intro", label: "Intro" },
              { id: "components", label: "Components" },
              { id: "hooks", label: "Hooks" },
              { id: "state", label: "State" },
            ],
            completedExercises: 2,
            completedLessons: 0,
            exercises: 4,
            lessons: 4,
            persistKey: "react-fundamentals",
            progress: 0,
            status: "in-progress",
            title: "Checklist-backed module",
          },
        ]}
        overallProgress={65}
        streak={7}
      >
        <ProgressTrackerOverview />
        <ProgressTrackerModules>
          <ProgressTrackerModule
            checklistItems={[
              { id: "intro", label: "Intro" },
              { id: "components", label: "Components" },
              { id: "hooks", label: "Hooks" },
              { id: "state", label: "State" },
            ]}
            completedExercises={2}
            completedLessons={0}
            exercises={4}
            lessons={4}
            persistKey="react-fundamentals"
            progress={0}
            status="in-progress"
            title="Checklist-backed module"
          />
        </ProgressTrackerModules>
      </ProgressTracker>,
    );

    expect(screen.getAllByText("0/4")).toHaveLength(2);

    act(() => {
      localStorage.setItem(
        "checklist:react-fundamentals",
        JSON.stringify(["intro", "components", "hooks"]),
      );
      window.dispatchEvent(
        new CustomEvent(CHECKLIST_PROGRESS_EVENT, {
          detail: { persistKey: "react-fundamentals" },
        }),
      );
    });

    expect(screen.getAllByText("3/4")).toHaveLength(2);
    expect(
      screen.getByRole("progressbar", {
        name: /checklist-backed module progress/i,
      }),
    ).toHaveAttribute("aria-valuenow", "75");
  });
});
