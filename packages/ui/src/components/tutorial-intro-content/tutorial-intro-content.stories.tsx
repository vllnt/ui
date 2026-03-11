import type { Meta, StoryObj } from "@storybook/react-vite";

import { TutorialIntroContent } from "./tutorial-intro-content";

const meta = {
  args: {
    content:
      "This tutorial covers the fundamentals of building modern React applications with TypeScript and Tailwind CSS.",
    title: "React Fundamentals",
  },
  component: TutorialIntroContent,
  title: "Components/TutorialIntroContent",
} satisfies Meta<typeof TutorialIntroContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
