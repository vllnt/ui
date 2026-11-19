import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CreditBadge } from "./credit-badge";

const TINTED_SURFACE =
  /(?:bg|border)-(?:amber|blue|emerald|red|sky|slate|violet)-|bg-destructive\/|border-destructive\//;

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

  it.each([
    ["healthy", "text-success"],
    ["low", "text-warning"],
    ["overdue", "text-destructive"],
    ["depleted", "text-muted-foreground"],
  ] as const)(
    "status %s puts its colour on the dot and keeps a neutral surface",
    (status, dotClass) => {
      const { container } = render(<CreditBadge status={status} />);
      const root = container.firstElementChild;
      expect(root?.querySelector("[data-badge-dot]")).toHaveClass(dotClass);
      expect(root).toHaveClass("bg-secondary");
      expect(root?.className).not.toMatch(TINTED_SURFACE);
    },
  );

  it("merges className and forwards extra props", () => {
    const { container } = render(
      <CreditBadge className="custom" status="healthy" title="Balance" />,
    );
    expect(container.firstElementChild).toHaveClass("custom");
    expect(container.firstElementChild).toHaveAttribute("title", "Balance");
  });
});
