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

  it.each([
    ["active", "Active", "text-success"],
    ["canceled", "Canceled", "text-muted-foreground"],
    ["past-due", "Past due", "text-warning"],
    ["trialing", "Trialing", "text-info"],
  ] as const)(
    "status %s shows %s with its colour on the dot only",
    (status, label, dotClass) => {
      render(
        <SubscriptionCard
          plan="growth"
          priceLabel="$49/mo"
          renewalLabel="Renews on May 1"
          status={status}
        />,
      );
      const chip = screen.getByText(label);
      expect(chip.querySelector("[data-badge-dot]")).toHaveClass(dotClass);
      expect(chip).toHaveClass("bg-secondary", "shrink-0", "whitespace-nowrap");
      expect(chip.className).not.toMatch(
        /(?:bg|border)-(?:amber|emerald|red|sky|slate)-|\/(?:5|10|40)\b/,
      );
    },
  );

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
