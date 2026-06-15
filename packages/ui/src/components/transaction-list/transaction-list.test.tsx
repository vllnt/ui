import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  formatTransactionAmount,
  formatTransactionDate,
  type Transaction,
  TransactionList,
} from "./transaction-list";

const FIXED_DATE = Date.UTC(2025, 2, 10);
const FIXED_DATE_LATER = Date.UTC(2025, 2, 8);

const TRANSACTIONS: Transaction[] = [
  {
    amountCents: 2000,
    createdAt: FIXED_DATE,
    description: "Credit reload",
    id: "1",
    type: "credit",
  },
  {
    amountCents: 150,
    createdAt: FIXED_DATE_LATER,
    description: "API usage - March",
    id: "2",
    type: "debit",
  },
];

describe("formatTransactionAmount", () => {
  it("formats with the default locale and currency", () => {
    expect(formatTransactionAmount(2000)).toBe("$20.00");
  });

  it("respects the locale + currency overrides", () => {
    expect(
      formatTransactionAmount(2000, { currency: "EUR", locale: "en-IE" }),
    ).toMatch(/€20\.00/);
  });

  it("delegates sign placement to Intl when signDisplay is set", () => {
    expect(formatTransactionAmount(2000, { signDisplay: "always" })).toBe(
      "+$20.00",
    );
    expect(formatTransactionAmount(-150, { signDisplay: "always" })).toBe(
      "-$1.50",
    );
  });

  it("produces well-formed bidirectional output for RTL locales", () => {
    const intlNegative = new Intl.NumberFormat("ar-SA", {
      currency: "SAR",
      signDisplay: "always",
      style: "currency",
    }).format(-20);
    expect(
      formatTransactionAmount(-2000, {
        currency: "SAR",
        locale: "ar-SA",
        signDisplay: "always",
      }),
    ).toBe(intlNegative);
  });
});

describe("formatTransactionDate", () => {
  it("formats with the default locale", () => {
    expect(formatTransactionDate(FIXED_DATE)).toMatch(/2025/);
  });
});

describe("TransactionList", () => {
  describe("rendering", () => {
    it("renders all transactions in order", () => {
      render(<TransactionList transactions={TRANSACTIONS} />);

      expect(screen.getByText("Credit reload")).toBeInTheDocument();
      expect(screen.getByText("API usage - March")).toBeInTheDocument();
    });

    it("emits data-transaction-type per row", () => {
      const { container } = render(
        <TransactionList transactions={TRANSACTIONS} />,
      );

      const items = container.querySelectorAll("li[data-transaction-type]");
      expect(items.length).toBe(2);
      expect(items[0]).toHaveAttribute("data-transaction-type", "credit");
      expect(items[1]).toHaveAttribute("data-transaction-type", "debit");
    });

    it("formats amounts with sign prefixes", () => {
      render(<TransactionList transactions={TRANSACTIONS} />);

      expect(screen.getByText("+$20.00")).toBeInTheDocument();
      expect(screen.getByText("-$1.50")).toBeInTheDocument();
    });

    it("renders the empty message when no transactions and no children", () => {
      render(
        <TransactionList
          emptyMessage="No transactions yet"
          transactions={[]}
        />,
      );

      expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    });

    it("hides the empty message when pinned children are rendered", () => {
      render(
        <TransactionList emptyMessage="No txn" transactions={[]}>
          <TransactionList.Pinned>
            <TransactionList.SubscriptionRow
              amountCents={1200}
              interval="month"
              plan="AI OS Pro"
              status="active"
            />
          </TransactionList.Pinned>
        </TransactionList>,
      );

      expect(screen.queryByText("No txn")).not.toBeInTheDocument();
      expect(screen.getByText("AI OS Pro")).toBeInTheDocument();
    });
  });

  describe("TransactionListSubscriptionRow", () => {
    it("renders the active badge and active-border style", () => {
      const { container } = render(
        <TransactionList transactions={[]}>
          <TransactionList.Pinned>
            <TransactionList.SubscriptionRow
              amountCents={1200}
              interval="month"
              plan="AI OS Pro"
              status="active"
            />
          </TransactionList.Pinned>
        </TransactionList>,
      );

      expect(screen.getByText("Active")).toBeInTheDocument();
      const subscriptionRow = container.querySelector("[data-status]");
      expect(subscriptionRow).toHaveAttribute("data-status", "active");
    });

    it("renders the renewal date when provided", () => {
      render(
        <TransactionList transactions={[]}>
          <TransactionList.Pinned>
            <TransactionList.SubscriptionRow
              amountCents={1200}
              interval="month"
              plan="AI OS Pro"
              renewsAt={Date.UTC(2025, 3, 15)}
              status="active"
            />
          </TransactionList.Pinned>
        </TransactionList>,
      );

      expect(screen.getByText(/Renews/)).toBeInTheDocument();
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });

    it("formats the per-interval amount", () => {
      render(
        <TransactionList transactions={[]}>
          <TransactionList.Pinned>
            <TransactionList.SubscriptionRow
              amountCents={1200}
              currency="EUR"
              interval="month"
              locale="en-IE"
              plan="AI OS Pro"
              status="active"
            />
          </TransactionList.Pinned>
        </TransactionList>,
      );

      expect(screen.getByText(/€12\.00\/mo/)).toBeInTheDocument();
    });

    it.each([
      ["active", "Active"],
      ["trialing", "Trial"],
      ["past_due", "Past due"],
      ["canceled", "Canceled"],
    ] as const)(
      "renders status=%s with badge label %s",
      (status, expectedLabel) => {
        render(
          <TransactionList transactions={[]}>
            <TransactionList.Pinned>
              <TransactionList.SubscriptionRow
                amountCents={1200}
                interval="month"
                plan="Plan"
                status={status}
              />
            </TransactionList.Pinned>
          </TransactionList>,
        );

        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      },
    );
  });
});
