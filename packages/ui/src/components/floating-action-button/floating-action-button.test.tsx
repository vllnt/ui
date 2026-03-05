import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloatingActionButton } from "./floating-action-button";

describe("FloatingActionButton", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<FloatingActionButton />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <FloatingActionButton className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<FloatingActionButton />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
