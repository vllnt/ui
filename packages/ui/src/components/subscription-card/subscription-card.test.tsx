import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SubscriptionCard } from "./subscription-card";

describe("SubscriptionCard", () => {
  it("renders billing summary content", () => {
    render(
      <SubscriptionCard
        plan="growth"
        priceLabel="$49/mo"
        renewalLabel="Renews on May 1"
        status="active"
      />,
    );

    expect(screen.getByText("Subscription")).toBeVisible();
    expect(screen.getByText("$49/mo")).toBeVisible();
    expect(screen.getByText("Growth")).toBeVisible();
  });

  it("renders optional detail rows", () => {
    render(
      <SubscriptionCard
        plan="starter"
        priceLabel="$19/mo"
        renewalLabel="Trial ends Apr 30"
        seatsLabel="3 seats"
        status="trialing"
        usageLabel="1.2M tokens"
      />,
    );

    expect(screen.getByText("3 seats")).toBeVisible();
    expect(screen.getByText("1.2M tokens")).toBeVisible();
    expect(screen.getByText("Trialing")).toBeVisible();
  });

  it("renders action buttons when labels are provided", () => {
    render(
      <SubscriptionCard
        plan="enterprise"
        priceLabel="Custom"
        primaryActionLabel="Manage plan"
        renewalLabel="Annual contract"
        secondaryActionLabel="View invoices"
        status="active"
      />,
    );

    expect(screen.getByRole("button", { name: "Manage plan" })).toBeVisible();
    expect(screen.getByRole("button", { name: "View invoices" })).toBeVisible();
  });
});
