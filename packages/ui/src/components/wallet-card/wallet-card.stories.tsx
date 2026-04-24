import type { Meta, StoryObj } from "@storybook/react-vite";

import { WalletCard } from "./wallet-card";

const meta = {
  args: {
    availableLabel: "96 credits",
    balanceLabel: "128 credits",
    note: "Set up auto-refill to keep automations running through the month.",
    pendingLabel: "32 credits",
    primaryActionLabel: "Buy credits",
    renewsLabel: "Refreshes on May 1, 2026",
    secondaryActionLabel: "Billing history",
    status: "healthy",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["healthy", "low", "depleted", "overdue"],
    },
  },
  component: WalletCard,
  title: "Account & Billing/WalletCard",
} satisfies Meta<typeof WalletCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Depleted: Story = {
  args: {
    availableLabel: "0 credits",
    balanceLabel: "0 credits",
    note: "Credits are exhausted. Add funds to keep background runs moving.",
    pendingLabel: "0 credits",
    renewsLabel: "Manual top-up required",
    status: "depleted",
  },
};
