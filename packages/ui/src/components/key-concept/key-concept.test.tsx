import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KeyConcept } from "./key-concept";

describe("KeyConcept", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<KeyConcept>Test Content</KeyConcept>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <KeyConcept className="custom-class">Test</KeyConcept>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<KeyConcept>Test</KeyConcept>);

      expect(container.firstChild).toBeVisible();
    });
  });
});
