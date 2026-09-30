import { render } from "@testing-library/react";
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
