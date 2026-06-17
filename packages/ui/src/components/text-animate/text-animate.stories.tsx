import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextAnimate } from "./text-animate";

const meta = {
  args: {
    children: "Welcome aboard the platform",
  },
  component: TextAnimate,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-3xl font-semibold text-foreground">
        <Story />
      </div>
    ),
  ],
  title: "Effects/TextAnimate",
} satisfies Meta<typeof TextAnimate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SlideUp: Story = {
  args: {
    animation: "slide-up",
  },
};

export const Blur: Story = {
  args: {
    animation: "blur",
  },
};

export const ByCharacter: Story = {
  args: {
    by: "character",
    delay: 30,
  },
};
