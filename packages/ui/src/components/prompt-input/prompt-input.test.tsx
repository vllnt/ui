import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PromptInput } from "./prompt-input";

describe("PromptInput", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<PromptInput />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<PromptInput className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders the toolbar slot", () => {
      render(<PromptInput toolbar={<span>Attach</span>} />);

      expect(screen.getByText("Attach")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("updates the value as the user types (uncontrolled)", () => {
      render(<PromptInput />);
      const textarea = screen.getByRole("textbox");

      fireEvent.change(textarea, { target: { value: "hello" } });

      expect(textarea).toHaveValue("hello");
    });

    it("calls onValueChange when typing", () => {
      const onValueChange = vi.fn();
      render(<PromptInput onValueChange={onValueChange} />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "hi" },
      });

      expect(onValueChange).toHaveBeenCalledWith("hi");
    });

    it("submits on Enter without Shift", () => {
      const onSubmit = vi.fn();
      render(<PromptInput onSubmit={onSubmit} />);
      const textarea = screen.getByRole("textbox");

      fireEvent.change(textarea, { target: { value: "send me" } });
      fireEvent.keyDown(textarea, { key: "Enter" });

      expect(onSubmit).toHaveBeenCalledWith("send me");
    });

    it("does not submit on Shift+Enter", () => {
      const onSubmit = vi.fn();
      render(<PromptInput onSubmit={onSubmit} />);
      const textarea = screen.getByRole("textbox");

      fireEvent.change(textarea, { target: { value: "draft" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does not submit when empty", () => {
      const onSubmit = vi.fn();
      render(<PromptInput onSubmit={onSubmit} />);

      fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("disables the submit button when empty", () => {
      render(<PromptInput submitLabel="Send" />);

      expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    });

    it("forwards a ref to the textarea", () => {
      const ref = { current: null as HTMLTextAreaElement | null };
      render(<PromptInput ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
