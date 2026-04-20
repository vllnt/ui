import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlanBadge } from "./plan-badge";

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
});
