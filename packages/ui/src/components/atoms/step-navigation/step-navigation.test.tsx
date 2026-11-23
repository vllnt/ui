import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StepNavigation } from "./step-navigation";

describe("StepNavigation", () => {
  it("applies custom className", () => {
    const { container } = render(<StepNavigation className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<StepNavigation />);
    expect(container.firstChild).toBeVisible();
  });
});

describe("StepNavigation names", () => {
  it("names the buttons by their visible, localizable labels (WCAG 2.5.3)", () => {
    render(
      <StepNavigation
        canNext
        canPrev
        nextLabel="Suivant"
        previousLabel="Précédent"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Précédent" }),
    ).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("button", { name: "Suivant" })).not.toHaveAttribute(
      "aria-label",
    );
  });
});
