import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThinkingBlock } from "./thinking-block";

describe("ThinkingBlock", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<ThinkingBlock />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<ThinkingBlock className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<ThinkingBlock />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
