import type { Meta, StoryObj } from "@storybook/react-vite";

import { CommentPin } from "./comment-pin";

const meta = {
  args: {
    count: 3,
    status: "open",
    x: 120,
    y: 80,
  },
  component: CommentPin,
  decorators: [
    (Story) => (
      <div className="relative h-[240px] w-[480px] rounded-2xl border bg-muted/30">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/CommentPin",
} satisfies Meta<typeof CommentPin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Cluster: Story = {
  render: () => (
    <>
      <CommentPin count={3} status="open" x={120} y={80} />
      <CommentPin initials="SS" status="unread" x={260} y={140} />
      <CommentPin count={1} status="resolved" x={380} y={50} />
    </>
  ),
};

export const InitialsOnly: Story = {
  args: { count: undefined, initials: "WC" },
};
