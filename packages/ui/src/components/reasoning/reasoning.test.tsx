import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Reasoning } from "./reasoning";

describe("Reasoning", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<Reasoning steps={["Step one"]} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <Reasoning className="custom-class" steps={["Step one"]} />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("interactions", () => {
    it("is collapsed by default and expands on toggle", () => {
      render(<Reasoning steps={["Parse the request"]} />);

      expect(screen.queryByText("Parse the request")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByText("Parse the request")).toBeInTheDocument();
    });

    it("calls onOpenChange when toggled", () => {
      const onOpenChange = vi.fn();
      render(<Reasoning onOpenChange={onOpenChange} steps={["Parse"]} />);

      fireEvent.click(screen.getByRole("button"));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("auto-expands while streaming", () => {
      render(<Reasoning isStreaming steps={["Thinking hard"]} />);

      expect(screen.getByText("Thinking hard")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
  });

  describe("content modes", () => {
    it("renders free-form children when no steps are provided", () => {
      render(<Reasoning isStreaming>Free-form reasoning text</Reasoning>);

      expect(screen.getByText("Free-form reasoning text")).toBeInTheDocument();
    });
  });
});
