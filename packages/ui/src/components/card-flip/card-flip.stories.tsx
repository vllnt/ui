import type { Meta, StoryObj } from "@storybook/react-vite";

import { CardFlip } from "./card-flip";

const meta = {
  args: {
    back: (
      <div className="flex h-full items-center justify-center rounded-xl border bg-primary p-6 text-primary-foreground">
        Back
      </div>
    ),
    front: (
      <div className="flex h-full items-center justify-center rounded-xl border bg-card p-6 text-card-foreground">
        Front
      </div>
    ),
  },
  component: CardFlip,
  decorators: [
    (Story) => (
      <div className="w-64 p-12">
        <Story />
      </div>
    ),
  ],
  title: "Effects/CardFlip",
} satisfies Meta<typeof CardFlip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickToFlip: Story = {
  args: {
    flipOnHover: false,
  },
};
