import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accordion } from "./accordion";

describe("Accordion", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<Accordion>Test Content</Accordion>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <Accordion className="custom-class">Test</Accordion>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<Accordion>Test</Accordion>);

      expect(container.firstChild).toBeVisible();
    });
  });
});
