import type { Meta, StoryObj } from "@storybook/react-vite";

import { TutorialCard } from "./tutorial-card";

const meta = {
  args: {
    labels: {
      completed: "completed",
      difficulty: {
    tutorial: {
      description: "A description",
      difficulty: "advanced",
      estimatedTime: "estimatedTime",
      id: "1",
      sectionCount: 0,
      tags: ["example"],
      title: "Example Title",
    },
  } as Record<string, string>,
      sectionsCount: "sectionsCount",
    },
    tutorial: {
      description: "A description",
      difficulty: "advanced",
      estimatedTime: "estimatedTime",
      id: "1",
      sectionCount: 0,
      tags: ["example"],
      title: "Example Title",
    },
  },
  component: TutorialCard,
  title: "Learning/TutorialCard",
} satisfies Meta<typeof TutorialCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
