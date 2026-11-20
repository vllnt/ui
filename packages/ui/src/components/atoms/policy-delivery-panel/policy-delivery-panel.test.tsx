import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PolicyDeliveryPanel, type PolicyEntry } from "./policy-delivery-panel";

const sample: PolicyEntry[] = [
  { id: "pii", name: "PII redaction", status: "enforced" },
  {
    description: "60 / s soft cap",
    id: "rate",
    name: "Rate limiting",
    status: "advisory",
  },
  { id: "exp", name: "Experiment B", status: "disabled" },
];

describe("PolicyDeliveryPanel", () => {
  it("renders the empty state when no policies are provided", () => {
    const { container } = render(<PolicyDeliveryPanel policies={[]} />);
    expect(
      container.querySelector("[data-policy-state='empty']"),
    ).toBeInTheDocument();
    expect(screen.getByText("No policies")).toBeInTheDocument();
  });

  it("renders one plain row per policy with status chip and description", () => {
    const { container } = render(<PolicyDeliveryPanel policies={sample} />);
    expect(container.querySelectorAll("[data-policy-row]")).toHaveLength(3);
    expect(screen.getByText("Enforced")).toBeInTheDocument();
    expect(screen.getByText("Advisory")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(screen.getByText("60 / s soft cap")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["Enforced", "text-success"],
    ["Advisory", "text-warning"],
    ["Disabled", "text-muted-foreground"],
  ] as const)(
    "status chip %s puts its colour on the dot and keeps a neutral surface",
    (label, dotClass) => {
      render(<PolicyDeliveryPanel policies={sample} />);
      const chip = screen.getByText(label);
      expect(chip.querySelector("[data-policy-status-dot]")).toHaveClass(
        dotClass,
      );
      expect(chip).toHaveClass("bg-secondary");
      expect(chip.className).not.toMatch(
        /(?:bg|border)-(?:amber|emerald|red|sky|slate)-|\/(?:5|10|40)\b/,
      );
    },
  );

  it("invokes onToggle when a row is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <PolicyDeliveryPanel
        policies={[
          {
            id: "pii",
            name: "PII redaction",
            onToggle: handleToggle,
            status: "enforced",
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
