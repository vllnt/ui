import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StepNavigation } from "./step-navigation";

describe("StepNavigation", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<StepNavigation />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<StepNavigation className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<StepNavigation />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
