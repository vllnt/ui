import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type PresenceMember,
  PresenceStack,
} from "./presence-stack";

const MEMBERS: PresenceMember[] = [
  { color: "emerald", id: "sam", name: "Sam Smith" },
  { id: "riley", name: "Riley", status: "idle" },
  { color: "rose", id: "wei", name: "Wei" },
  { id: "jordan", name: "Jordan Doe" },
  { id: "alex", name: "Alex" },
  { id: "morgan", name: "Morgan" },
];

const meta = {
  args: { max: 4, members: MEMBERS },
  component: PresenceStack,
  title: "Canvas/PresenceStack",
} satisfies Meta<typeof PresenceStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewMembers: Story = {
  args: { members: MEMBERS.slice(0, 2) },
};

export const Interactive: Story = {
  args: {
    onSelect: (member) => {
      // eslint-disable-next-line no-console
      console.info(member.id);
    },
  },
};

export const HighOverflow: Story = {
  args: { max: 2 },
};
