import type { Meta, StoryObj } from "@storybook/react-vite";

import { BorderBeam } from "./border-beam";

const meta = {
  args: {
    duration: 6,
  },
  component: BorderBeam,
  decorators: [
    (Story) => (
      <div className="relative w-full max-w-md rounded-xl border bg-card p-6">
        <Story />
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="text-xl font-semibold">Live preview</div>
          <div className="text-sm text-muted-foreground">
            Animated border treatment for highlighted surfaces.
          </div>
        </div>
      </div>
    ),
  ],
  title: "Utility/BorderBeam",
} satisfies Meta<typeof BorderBeam>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reverse: Story = {
  args: {
    reverse: true,
  },
};
