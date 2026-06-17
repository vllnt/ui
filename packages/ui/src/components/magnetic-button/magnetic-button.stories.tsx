import type { Meta, StoryObj } from "@storybook/react-vite";

import { MagneticButton } from "./magnetic-button";

const meta = {
  args: {
    children: "Hover me",
  },
  component: MagneticButton,
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
  title: "Effects/MagneticButton",
} satisfies Meta<typeof MagneticButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className:
      "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
  },
};

export const Strong: Story = {
  args: {
    className:
      "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
    strength: 0.8,
  },
};
