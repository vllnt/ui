import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CodeBlock, extractTextFromChildren } from "./code-block";

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

    it("extracts strings, numbers, arrays, and nested element text from children", () => {
      expect(
        extractTextFromChildren([
          "const value = ",
          1,
          <span key="nested">
            ;<strong> return value;</strong>
          </span>,
        ]),
      ).toBe("const value = 1; return value;");
    });

    it("accepts ReactNode children", () => {
      const { container } = render(
        <CodeBlock>
          <span>const value = 1;</span>
        </CodeBlock>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<CodeBlock />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
