import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<CodeBlock />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<CodeBlock className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<CodeBlock />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
