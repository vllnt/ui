import type { Meta, StoryObj } from "@storybook/react-vite";

import { type SnapGuide, SnapGuides } from "./snap-guides";

const GUIDES: SnapGuide[] = [
  { id: "v-120", orientation: "vertical", x: 120 },
  { id: "v-340", orientation: "vertical", x: 340 },
  { id: "h-90", orientation: "horizontal", y: 90 },
  { id: "h-200", orientation: "horizontal", y: 200 },
];

const meta = {
  args: { guides: GUIDES },
  component: SnapGuides,
  decorators: [
    (Story) => (
      <div className="relative h-[280px] w-[480px] rounded-2xl border bg-muted/30">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/SnapGuides",
} satisfies Meta<typeof SnapGuides>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleVertical: Story = {
  args: {
    guides: [{ id: "v-200", orientation: "vertical", x: 200 }],
  },
};

export const Empty: Story = { args: { guides: [] } };
