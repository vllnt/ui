import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlanBadge } from "./plan-badge";

const meta = {
  args: {
    state: "current",
    tier: "growth",
  },
  argTypes: {
    state: {
      control: "select",
      options: ["current", "trial", "legacy"],
    },
    tier: {
      control: "select",
      options: ["free", "starter", "growth", "enterprise"],
    },
  },
  component: PlanBadge,
  title: "Account & Billing/PlanBadge",
} satisfies Meta<typeof PlanBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllTiers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <PlanBadge tier="free" />
      <PlanBadge tier="starter" />
      <PlanBadge tier="growth" />
      <PlanBadge tier="enterprise" />
    </div>
  ),
};

export const Trial: Story = {
  args: {
    state: "trial",
    tier: "starter",
  },
};
