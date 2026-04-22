import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WalletCard } from "./wallet-card";

describe("WalletCard", () => {
  it("renders wallet balance information", () => {
    render(<WalletCard balanceLabel="128 credits" status="healthy" />);

    expect(screen.getByText("Wallet")).toBeVisible();
    expect(screen.getAllByText("128 credits").length).toBeGreaterThan(0);
  });

  it("renders supporting rows when provided", () => {
    render(
      <WalletCard
        availableLabel="96 credits"
        balanceLabel="128 credits"
        pendingLabel="32 credits"
        renewsLabel="Auto-refresh on May 1"
        status="low"
      />,
    );

    expect(screen.getByText("96 credits")).toBeVisible();
    expect(screen.getByText("32 credits")).toBeVisible();
    expect(screen.getAllByText("Auto-refresh on May 1").length).toBe(2);
  });

  it("renders action buttons when labels are provided", () => {
    render(
      <WalletCard
        balanceLabel="0 credits"
        primaryActionLabel="Buy credits"
        secondaryActionLabel="Billing history"
        status="depleted"
      />,
    );

    expect(screen.getByRole("button", { name: "Buy credits" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Billing history" }),
    ).toBeVisible();
  });
});
