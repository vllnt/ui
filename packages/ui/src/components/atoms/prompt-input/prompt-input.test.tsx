import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PromptInput } from "./prompt-input";

describe("PromptInput", () => {
  it("merges className, renders the toolbar slot and forwards a ref to the textarea", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    const { container } = render(
      <PromptInput
        className="custom-class"
        ref={ref}
        toolbar={<span>Attach</span>}
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(screen.getByText("Attach")).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("updates the value as the user types and calls onValueChange", () => {
    const onValueChange = vi.fn();
    render(<PromptInput onValueChange={onValueChange} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    expect(textarea).toHaveValue("hello");
    expect(onValueChange).toHaveBeenCalledWith("hello");
  });

  it("submits on Enter without Shift but not on Shift+Enter", () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "send me" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("send me");
  });

  it("does not submit and disables the submit button when empty", () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} submitLabel="Send" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });
});
