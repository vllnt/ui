import type { Meta, StoryObj } from "@storybook/react-vite";

import { TutorialMDX } from "./tutorial-mdx";

const meta = {
  args: {
    content:
      "# Advanced React Patterns\n\nLearn about compound components, render props, and custom hooks.",
  },
  component: TutorialMDX,
  title: "Components/TutorialMdx",
} satisfies Meta<typeof TutorialMDX>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
