import type { Meta, StoryObj } from "@storybook/react-vite";

import { AvatarGroup } from "./avatar-group";

const people = [
  { alt: "Ada Lovelace", fallback: "AL" },
  { alt: "Grace Hopper", fallback: "GH" },
  { alt: "Margaret Hamilton", fallback: "MH" },
  { alt: "Katherine Johnson", fallback: "KJ" },
  { alt: "Annie Easley", fallback: "AE" },
];

const meta = {
  args: {
    items: people,
    max: 4,
  },
  component: AvatarGroup,
  title: "Data/AvatarGroup",
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <AvatarGroup items={people} max={4} size="sm" />
      <AvatarGroup items={people} max={4} size="md" />
      <AvatarGroup items={people} max={4} size="lg" />
    </div>
  ),
};