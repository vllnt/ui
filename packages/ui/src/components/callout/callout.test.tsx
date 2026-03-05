import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout } from "./callout";

describe("Callout", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<Callout>Test Content</Callout>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <Callout className="custom-class">Test</Callout>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<Callout>Test</Callout>);

      expect(container.firstChild).toBeVisible();
    });
  });
});
