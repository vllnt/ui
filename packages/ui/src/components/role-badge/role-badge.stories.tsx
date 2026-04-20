import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoleBadge } from "./role-badge";

const meta = {
  args: {
    accountRole: "owner",
  },
  argTypes: {
    accountRole: {
      control: "select",
      options: ["admin", "billing", "member", "owner"],
    },
  },
  component: RoleBadge,
  title: "Account & Billing/RoleBadge",
} satisfies Meta<typeof RoleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TeamRoles: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <RoleBadge accountRole="owner" />
      <RoleBadge accountRole="admin" />
      <RoleBadge accountRole="member" />
      <RoleBadge accountRole="billing" />
    </div>
  ),
};
