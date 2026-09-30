import type { Meta, StoryObj } from "@storybook/react-vite";

import { SubscriptionCard } from "./subscription-card";

const meta = {
  args: {
    note: "Your annual discount is locked in until the next renewal date.",
    plan: "growth",
    priceLabel: "$49/mo",
    primaryActionLabel: "Manage plan",
    renewalLabel: "Renews on May 1, 2026",
    secondaryActionLabel: "View invoices",
    seatsLabel: "12 seats",
    status: "active",
    usageLabel: "4.2M tokens used",
  },
  argTypes: {
    plan: {
      control: "select",
      options: ["free", "starter", "growth", "enterprise"],
    },
    status: {
      control: "select",
      options: ["active", "trialing", "past-due", "canceled"],
    },
  },
  component: SubscriptionCard,
  title: "Account & Billing/SubscriptionCard",
} satisfies Meta<typeof SubscriptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Trialing: Story = {
  args: {
    note: "Upgrade before the trial ends to avoid losing unlimited history.",
    plan: "starter",
    priceLabel: "$19/mo",
    renewalLabel: "Trial ends on Apr 30, 2026",
    seatsLabel: "3 seats",
    status: "trialing",
    usageLabel: "820k tokens used",
  },
};
