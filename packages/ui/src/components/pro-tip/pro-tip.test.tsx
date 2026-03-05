import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProTip } from "./pro-tip";

describe("ProTip", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<ProTip>Test Content</ProTip>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <ProTip className="custom-class">Test</ProTip>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<ProTip>Test</ProTip>);

      expect(container.firstChild).toBeVisible();
    });
  });
});
