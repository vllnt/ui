import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CreditBadge } from "./credit-badge";

describe("CreditBadge", () => {
  it("renders the balance amount when provided", () => {
    render(<CreditBadge amount="128 credits" status="healthy" />);

    expect(screen.getByText(/128 credits/i)).toBeVisible();
  });

  it("renders the status label", () => {
    render(<CreditBadge status="low" />);

    expect(screen.getByText("Credits running low")).toBeInTheDocument();
  });

  it("accepts a custom label", () => {
    render(<CreditBadge label="Top up recommended" status="depleted" />);

    expect(screen.getByText("Top up recommended")).toBeVisible();
  });
});
