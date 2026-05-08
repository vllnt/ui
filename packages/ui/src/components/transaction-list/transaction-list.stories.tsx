import type { Meta, StoryObj } from "@storybook/react-vite";

import { type Transaction, TransactionList } from "./transaction-list";

const TRANSACTIONS: Transaction[] = [
  {
    amountCents: 2000,
    createdAt: Date.UTC(2025, 2, 10),
    description: "Credit reload",
    id: "1",
    type: "credit",
  },
  {
    amountCents: 150,
    createdAt: Date.UTC(2025, 2, 8),
    description: "API usage - March",
    id: "2",
    type: "debit",
  },
  {
    amountCents: 500,
    createdAt: Date.UTC(2025, 2, 4),
    description: "Refund — duplicate charge",
    id: "3",
    meta: "Reference R-117",
    type: "refund",
  },
  {
    amountCents: 1500,
    createdAt: Date.UTC(2025, 1, 28),
    description: "Initial credit",
    id: "4",
    type: "initial",
  },
];

const meta = {
  args: {
    currency: "USD",
    emptyMessage: "No transactions yet",
    locale: "en-US",
    transactions: TRANSACTIONS,
  },
  component: TransactionList,
  title: "Billing/TransactionList",
} satisfies Meta<typeof TransactionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubscription: Story = {
  args: {
    currency: "EUR",
    locale: "en-IE",
  },
  render: (args) => (
    <TransactionList {...args}>
      <TransactionList.Pinned>
        <TransactionList.SubscriptionRow
          amountCents={1200}
          currency="EUR"
          interval="month"
          locale="en-IE"
          meta="VAT incl."
          plan="AI OS Pro"
          renewsAt={Date.UTC(2025, 3, 15)}
          status="active"
        />
      </TransactionList.Pinned>
    </TransactionList>
  ),
};

export const TrialAndPastDue: Story = {
  args: {
    transactions: [],
  },
  render: (args) => (
    <TransactionList {...args}>
      <TransactionList.Pinned>
        <TransactionList.SubscriptionRow
          amountCents={1900}
          interval="month"
          plan="Pro Trial"
          renewsAt={Date.UTC(2025, 2, 25)}
          status="trialing"
        />
        <TransactionList.SubscriptionRow
          amountCents={4900}
          interval="year"
          plan="Team"
          renewsAt={Date.UTC(2025, 3, 1)}
          status="past_due"
        />
      </TransactionList.Pinned>
    </TransactionList>
  ),
};

export const Empty: Story = {
  args: {
    transactions: [],
  },
};
