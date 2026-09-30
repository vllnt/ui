import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

  describe("focus", () => {
    it("focuses on mount and does not refocus after re-render once blurred", () => {
      const onCommit = vi.fn();
      const { rerender } = render(
        <InlineInput onChange={vi.fn()} onCommit={onCommit} value="a" />,
      );
      const input = screen.getByRole("textbox");

      expect(input).toHaveFocus();

      fireEvent.blur(input);
      input.blur();
      rerender(
        <InlineInput onChange={vi.fn()} onCommit={onCommit} value="ab" />,
      );

      expect(input).not.toHaveFocus();
    });
  });

  describe("accessibility", () => {
    it("is visible when rendered", () => {
      const { container } = render(<InlineInput />);

      expect(container.firstChild).toBeVisible();
    });
  });
});
