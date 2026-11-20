import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlanBadge } from "./plan-badge";

const TINTED_SURFACE =
  /(?:bg|border)-(?:amber|blue|emerald|red|sky|slate|violet)-|(?:bg|border)-primary\/\d/;

describe("PlanBadge", () => {
  it("renders the plan tier label", () => {
    render(<PlanBadge tier="growth" />);
    expect(screen.getByText("Growth")).toBeInTheDocument();
  });

  it("renders state text for trial plans", () => {
    render(<PlanBadge state="trial" tier="starter" />);
    expect(screen.getByText("Trial")).toBeVisible();
  });

  it("accepts a custom label", () => {
    render(<PlanBadge label="Team" tier="enterprise" />);
    expect(screen.getByText("Team")).toBeVisible();
  });

  it.each([
    ["enterprise", "current", "text-primary"],
    ["free", "current", "text-muted-foreground"],
    ["growth", "current", "text-info"],
    ["starter", "current", "text-success"],
    ["starter", "trial", "text-info"],
    ["enterprise", "legacy", "text-warning"],
  ] as const)(
    "tier %s in state %s puts its colour (%s) on the dot only",
    (tier, state, dotClass) => {
      const { container } = render(<PlanBadge state={state} tier={tier} />);
      const root = container.firstElementChild;
      expect(root?.querySelector("[data-badge-dot]")).toHaveClass(dotClass);
      expect(root).toHaveClass("bg-secondary");
      expect(root?.className).not.toMatch(TINTED_SURFACE);
    },
  );
});
