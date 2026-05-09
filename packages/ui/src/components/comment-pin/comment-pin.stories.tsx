import type { Meta, StoryObj } from "@storybook/react-vite";

import { CommentPin } from "./comment-pin";

const noop = (): void => undefined;

const meta = {
  args: {
    authorInitial: "B",
    color: "#5b8def",
    onActivate: noop,
    unread: 3,
    x: 120,
    y: 100,
  },
  component: CommentPin,
  decorators: [
    (Story) => (
      <div
        className="relative bg-muted/30"
        style={{ height: 220, width: 240 }}
      >
        <Story />
      </div>
    ),
  ],
  title: "Canvas/CommentPin",
} satisfies Meta<typeof CommentPin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Resolved: Story = {
  args: {
    state: "resolved",
    unread: undefined,
  },
};

export const NoUnread: Story = {
  args: { unread: undefined },
};

export const NonInteractive: Story = {
  args: { onActivate: undefined },
};
