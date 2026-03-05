import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineInput } from "./inline-input";

describe("InlineInput", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<InlineInput />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<InlineInput className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<InlineInput />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
