import type { Meta, StoryObj } from "@storybook/react-vite";

import { CreditBadge } from "./credit-badge";

const meta = {
  args: {
    amount: "128 credits",
    status: "healthy",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["healthy", "low", "depleted", "overdue"],
    },
  },
  component: CreditBadge,
  title: "Account & Billing/CreditBadge",
} satisfies Meta<typeof CreditBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <CreditBadge amount="420 credits" status="healthy" />
      <CreditBadge amount="24 credits" status="low" />
      <CreditBadge amount="0 credits" status="depleted" />
      <CreditBadge amount="-$42" status="overdue" />
    </div>
  ),
};
