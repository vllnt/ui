import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextReveal } from "./text-reveal";

const meta = {
  args: {
    children: "Scroll to read this line word by word as it brightens.",
  },
  component: TextReveal,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-2xl font-semibold">
        <Story />
      </div>
    ),
  ],
  title: "Effects/TextReveal",
} satisfies Meta<typeof TextReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
