import { expect, test } from "@playwright/experimental-ct-react";

import {
  ProgressTracker,
  ProgressTrackerModule,
  ProgressTrackerModules,
  ProgressTrackerOverview,
  ProgressTrackerStat,
  ProgressTrackerStats,
} from "./progress-tracker";

const modules = [
  {
    badge: "Foundation",
    completedExercises: 18,
    completedLessons: 12,
    currentLesson: "Final assessment",
    description: "Build confidence with variables, functions, and arrays.",
    exercises: 18,
    lessons: 12,
    progress: 1,
    skills: ["Syntax", "Functions", "Arrays"],
    status: "completed" as const,
    timeSpent: "8h 10m",
    title: "JavaScript Basics",
  },
  {
    badge: "Now learning",
    completedExercises: 5,
    completedLessons: 3,
    currentLesson: "Hooks in action",
    description: "Move from JSX to reusable interactive interfaces.",
    exercises: 12,
    lessons: 8,
    progress: 0.4,
    skills: ["Components", "Hooks", "State"],
    status: "in-progress" as const,
    timeSpent: "6h 20m",
    title: "React Fundamentals",
  },
  {
    badge: "Next up",
    completedExercises: 0,
    completedLessons: 0,
    currentLesson: "Unlock after React Fundamentals",
    description: "Design resilient APIs and asynchronous application flows.",
    exercises: 10,
    lessons: 6,
    progress: 0,
    skills: ["REST", "Caching", "Error handling"],
    status: "available" as const,
    title: "API Design",
  },
];

test.describe("ProgressTracker Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="p-6">
        <ProgressTracker modules={modules} overallProgress={0.65} streak={7}>
          <ProgressTrackerOverview />
          <ProgressTrackerStats>
            <ProgressTrackerStat label="Streak" value="7 days" />
            <ProgressTrackerStat label="Time Spent" value="24h" />
            <ProgressTrackerStat label="Exercises" value="45/80" />
            <ProgressTrackerStat label="Skills unlocked" value="12" />
          </ProgressTrackerStats>
          <ProgressTrackerModules>
            {modules.map((module) => (
              <ProgressTrackerModule key={module.title} {...module} />
            ))}
          </ProgressTrackerModules>
        </ProgressTracker>
      </div>,
    );

    await expect(page).toHaveScreenshot("progress-tracker-default.png");
  });
});
