import type { Meta, StoryObj } from "@storybook/react-vite";

import { DotPattern } from "./dot-pattern";

const meta = {
  component: DotPattern,
  decorators: [
    (Story) => (
      <div className="relative h-64 w-96 overflow-hidden rounded-xl border bg-card">
        <Story />
      </div>
    ),
  ],
  title: "Effects/DotPattern",
} satisfies Meta<typeof DotPattern>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WideSpacing: Story = {
  args: {
    dotRadius: 1.5,
    fade: false,
    spacing: 32,
  },
};
