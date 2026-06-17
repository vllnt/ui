import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedTabs } from "./animated-tabs";

const meta = {
  args: {
    tabs: [
      { label: "Overview", value: "overview" },
      { label: "Activity", value: "activity" },
      { label: "Settings", value: "settings" },
    ],
  },
  component: AnimatedTabs,
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
  title: "Effects/AnimatedTabs",
} satisfies Meta<typeof AnimatedTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondActive: Story = {
  args: {
    defaultValue: "activity",
  },
};
