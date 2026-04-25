import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ProgressTracker,
  ProgressTrackerModule,
  ProgressTrackerModules,
  ProgressTrackerOverview,
  ProgressTrackerStat,
  ProgressTrackerStats,
  type ProgressTrackerProps,
} from "./progress-tracker";

const meta = {
  args: {
    modules: [
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
        status: "completed",
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
        status: "in-progress",
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
        status: "available",
        timeSpent: "0h",
        title: "API Design",
      },
      {
        badge: "Locked",
        completedExercises: 0,
        completedLessons: 0,
        currentLesson: "Requires API Design",
        description: "Bring everything together with deployment and observability.",
        exercises: 14,
        lessons: 9,
        progress: 0,
        skills: ["CI", "Monitoring", "Release"],
        status: "locked",
        timeSpent: "0h",
        title: "Ship to production",
      },
    ],
    overallProgress: 0.65,
    streak: 7,
    title: "Frontend mastery path",
  },
  component: ProgressTracker,
  title: "Learning/ProgressTracker",
} satisfies Meta<typeof ProgressTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

function ProgressTrackerStory(args: ProgressTrackerProps): React.ReactNode {
  return (
    <ProgressTracker {...args} className="max-w-6xl">
      <ProgressTrackerOverview description="A curriculum-level dashboard for lessons, exercises, and learning streaks." />
      <ProgressTrackerStats>
        <ProgressTrackerStat label="Streak" value="7 days" />
        <ProgressTrackerStat label="Time Spent" value="24h" />
        <ProgressTrackerStat label="Exercises" value="45/80" />
        <ProgressTrackerStat label="Skills unlocked" value="12" />
      </ProgressTrackerStats>
      <ProgressTrackerModules>
        {args.modules?.map((module) => (
          <ProgressTrackerModule key={module.title} {...module} />
        ))}
      </ProgressTrackerModules>
    </ProgressTracker>
  );
}

export const Default: Story = {
  render: (args) => <ProgressTrackerStory {...args} />,
};

export const CompactDashboard: Story = {
  args: {
    overallProgress: 0.82,
    streak: 12,
    title: "Bootcamp progress",
  },
  render: (args) => <ProgressTrackerStory {...args} />,
};
