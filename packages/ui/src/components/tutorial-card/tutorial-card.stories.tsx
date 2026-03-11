import type { Meta, StoryObj } from "@storybook/react-vite";

import { TutorialCard } from "./tutorial-card";

const meta = {
  component: TutorialCard,
  title: "Learning/TutorialCard",
} satisfies Meta<typeof TutorialCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
