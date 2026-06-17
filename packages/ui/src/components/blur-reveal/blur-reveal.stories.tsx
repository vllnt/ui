import type { Meta, StoryObj } from "@storybook/react-vite";

import { BlurReveal } from "./blur-reveal";

const meta = {
  args: {
    children: "I sharpen into view",
  },
  component: BlurReveal,
  decorators: [
    (Story) => (
      <div className="p-12">
        <Story />
      </div>
    ),
  ],
  title: "Effects/BlurReveal",
} satisfies Meta<typeof BlurReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Delayed: Story = {
  args: {
    delay: 300,
  },
};
