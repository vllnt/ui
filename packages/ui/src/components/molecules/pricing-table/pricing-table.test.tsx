import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PricingPlan, PricingTable } from "./pricing-table";

describe("PricingPlan", () => {
  it("renders name, price, period, description and badge", () => {
    render(
      <PricingPlan
        badge="Most Popular"
        description="For teams"
        highlighted
        name="Pro"
        period="/month"
        price="$29"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Pro" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$29")).toBeInTheDocument();
    expect(screen.getByText("/month")).toBeInTheDocument();
    expect(screen.getByText("For teams")).toBeInTheDocument();
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("invokes the cta onClick", () => {
    const onClick = vi.fn();
    render(
      <PricingPlan
        cta={{ label: "Start trial", onClick }}
        name="Pro"
        price="$29"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start trial" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders included, excluded (struck-through) and limited-value features with accessible indicators", () => {
    render(
      <PricingPlan
        features={[
          { included: true, label: "Unlimited projects" },
          { included: false, label: "API access" },
          { included: "5 users", label: "Team seats" },
        ]}
        name="Pro"
        price="$29"
      />,
    );
    expect(screen.getByText("Unlimited projects")).toBeInTheDocument();
    expect(screen.getAllByText("Included:")).toHaveLength(2);
    expect(screen.getByText("API access")).toHaveClass("line-through");
    expect(screen.getByText("Not included:")).toBeInTheDocument();
    expect(screen.getByText("Team seats")).toBeInTheDocument();
    expect(screen.getByText("(5 users)")).toBeInTheDocument();
  });
});

describe("PricingTable", () => {
  it("renders all child plans without a period toggle by default", () => {
    render(
      <PricingTable>
        <PricingPlan name="Free" price="$0" />
        <PricingPlan name="Pro" price="$29" />
      </PricingTable>,
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("renders a roving-tabindex toggle that flips selection on click in uncontrolled mode", () => {
    render(
      <PricingTable showPeriodToggle>
        <PricingPlan name="Free" price="$0" />
      </PricingTable>,
    );
    const monthly = screen.getByRole("radio", { name: "Monthly" });
    const annual = screen.getByRole("radio", { name: "Annual" });
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(monthly).toBeChecked();
    expect(monthly).toHaveAttribute("tabindex", "0");
    expect(annual).toHaveAttribute("tabindex", "-1");
    fireEvent.click(annual);
    expect(annual).toBeChecked();
  });

  it("emits onPeriodChange in controlled mode", () => {
    const onPeriodChange = vi.fn();
    render(
      <PricingTable
        onPeriodChange={onPeriodChange}
        period="monthly"
        showPeriodToggle
      >
        <PricingPlan name="Free" price="$0" />
      </PricingTable>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Annual" }));
    expect(onPeriodChange).toHaveBeenCalledWith("annual");
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();
  });

  it("moves selection with arrow keys", () => {
    const onPeriodChange = vi.fn();
    render(
      <PricingTable onPeriodChange={onPeriodChange} showPeriodToggle>
        <PricingPlan name="Free" price="$0" />
      </PricingTable>,
    );
    fireEvent.keyDown(screen.getByRole("radio", { name: "Monthly" }), {
      key: "ArrowRight",
    });
    expect(onPeriodChange).toHaveBeenCalledWith("annual");
    expect(screen.getByRole("radio", { name: "Annual" })).toBeChecked();
  });

  it("renders custom labels and savings text", () => {
    render(
      <PricingTable
        periodLabels={{
          annual: "Yearly",
          monthly: "Per month",
          savings: "Save 20%",
        }}
        showPeriodToggle
      >
        <PricingPlan name="Free" price="$0" />
      </PricingTable>,
    );
    expect(
      screen.getByRole("radio", { name: /Per month/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Save 20%")).toBeInTheDocument();
  });
});
