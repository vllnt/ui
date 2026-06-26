import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShineBorder } from "./shine-border";

const meta = {
  args: {
    children: "Featured",
  },
  component: ShineBorder,
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
  title: "Effects/ShineBorder",
} satisfies Meta<typeof ShineBorder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "rounded-xl bg-card px-8 py-6 text-card-foreground",
  },
};

export const Thick: Story = {
  args: {
    borderWidth: 3,
    className: "rounded-xl bg-card px-8 py-6 text-card-foreground",
    duration: 4,
  },
};
