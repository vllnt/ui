import { expect, test } from "@playwright/experimental-ct-react";

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
];

test.describe("TransactionList Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <TransactionList currency="EUR" locale="en-IE" transactions={TRANSACTIONS}>
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
      </TransactionList>,
    );
    await expect(component).toHaveScreenshot("transaction-list-default.png");
  });

  test("empty", async ({ mount }) => {
    const component = await mount(
      <TransactionList emptyMessage="No transactions yet" transactions={[]} />,
    );
    await expect(component).toHaveScreenshot("transaction-list-empty.png");
  });
});
