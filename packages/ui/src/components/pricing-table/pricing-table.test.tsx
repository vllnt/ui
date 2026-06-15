import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PricingPlan, PricingTable } from "./pricing-table";

describe("PricingPlan", () => {
  describe("rendering", () => {
    it("renders name, price, and period", () => {
      render(<PricingPlan name="Pro" period="/month" price="$29" />);

      expect(
        screen.getByRole("heading", { level: 3, name: "Pro" }),
      ).toBeInTheDocument();
      expect(screen.getByText("$29")).toBeInTheDocument();
      expect(screen.getByText("/month")).toBeInTheDocument();
    });

    it("renders the description when provided", () => {
      render(<PricingPlan description="For teams" name="Pro" price="$29" />);

      expect(screen.getByText("For teams")).toBeInTheDocument();
    });

    it("renders the badge when provided", () => {
      render(
        <PricingPlan badge="Most Popular" highlighted name="Pro" price="$29" />,
      );

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
  });

  describe("features", () => {
    it("renders included features", () => {
      render(
        <PricingPlan
          features={[{ included: true, label: "Unlimited projects" }]}
          name="Pro"
          price="$29"
        />,
      );

      expect(screen.getByText("Unlimited projects")).toBeInTheDocument();
    });

    it("renders excluded features with a strike-through", () => {
      render(
        <PricingPlan
          features={[{ included: false, label: "API access" }]}
          name="Free"
          price="$0"
        />,
      );

      expect(screen.getByText("API access")).toHaveClass("line-through");
    });

    it("exposes an accessible exclusion indicator for excluded features", () => {
      render(
        <PricingPlan
          features={[{ included: false, label: "API access" }]}
          name="Free"
          price="$0"
        />,
      );

      expect(screen.getByText("Not included:")).toBeInTheDocument();
    });

    it("exposes an accessible inclusion indicator for included features", () => {
      render(
        <PricingPlan
          features={[{ included: true, label: "Unlimited projects" }]}
          name="Pro"
          price="$29"
        />,
      );

      expect(screen.getByText("Included:")).toBeInTheDocument();
    });

    it("renders limited-value features alongside the label", () => {
      render(
        <PricingPlan
          features={[{ included: "5 users", label: "Team seats" }]}
          name="Free"
          price="$0"
        />,
      );

      expect(screen.getByText("Team seats")).toBeInTheDocument();
      expect(screen.getByText("(5 users)")).toBeInTheDocument();
    });
  });
});

describe("PricingTable", () => {
  describe("layout", () => {
    it("renders all child plans", () => {
      render(
        <PricingTable>
          <PricingPlan name="Free" price="$0" />
          <PricingPlan name="Pro" price="$29" />
        </PricingTable>,
      );

      expect(screen.getByText("Free")).toBeInTheDocument();
      expect(screen.getByText("Pro")).toBeInTheDocument();
    });
  });

  describe("period toggle", () => {
    it("renders the toggle when showPeriodToggle is true", () => {
      render(
        <PricingTable showPeriodToggle>
          <PricingPlan name="Free" price="$0" />
        </PricingTable>,
      );

      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();
    });

    it("does not render the toggle by default", () => {
      render(
        <PricingTable>
          <PricingPlan name="Free" price="$0" />
        </PricingTable>,
      );

      expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    });

    it("flips selection on click in uncontrolled mode", () => {
      render(
        <PricingTable showPeriodToggle>
          <PricingPlan name="Free" price="$0" />
        </PricingTable>,
      );

      fireEvent.click(screen.getByRole("radio", { name: "Annual" }));

      expect(screen.getByRole("radio", { name: "Annual" })).toBeChecked();
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

    it("uses a roving tabIndex so only the selected radio is tabbable", () => {
      render(
        <PricingTable showPeriodToggle>
          <PricingPlan name="Free" price="$0" />
        </PricingTable>,
      );

      expect(screen.getByRole("radio", { name: "Monthly" })).toHaveAttribute(
        "tabindex",
        "0",
      );
      expect(screen.getByRole("radio", { name: "Annual" })).toHaveAttribute(
        "tabindex",
        "-1",
      );
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
});
