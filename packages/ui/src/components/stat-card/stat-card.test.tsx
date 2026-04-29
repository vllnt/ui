import { render, screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { describe, expect, it } from "vitest";

import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="MRR" value="$42.8k" />);

    expect(screen.getByText("MRR")).toBeVisible();
    expect(screen.getByText("$42.8k")).toBeVisible();
  });

  it("renders optional metadata", () => {
    render(
      <StatCard
        change="+12.4%"
        description="Month-over-month growth"
        icon={<Activity className="h-4 w-4" />}
        label="Activation"
        meta="Updated 5 minutes ago"
        trend="up"
        value="71%"
      />,
    );

    expect(screen.getByText("Month-over-month growth")).toBeVisible();
    expect(screen.getByText("Updated 5 minutes ago")).toBeVisible();
  });

  it("accepts custom class names", () => {
    render(<StatCard className="custom-class" label="Latency" value="92ms" />);

    expect(screen.getByText("Latency").closest("div.rounded-lg")).toHaveClass(
      "custom-class",
    );
  });
});
