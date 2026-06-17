import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrambleText } from "./scramble-text";

const meta = {
  args: {
    text: "DECRYPTED",
  },
  component: ScrambleText,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-3xl font-semibold text-foreground">
        <Story />
      </div>
    ),
  ],
  title: "Effects/ScrambleText",
} satisfies Meta<typeof ScrambleText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slow: Story = {
  args: {
    duration: 2400,
  },
};
