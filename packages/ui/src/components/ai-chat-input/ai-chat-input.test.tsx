import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatInput } from "./ai-chat-input";

describe("AIChatInput", () => {
  it("renders helper text and status", () => {
    render(
      <AIChatInput
        helperText="Shift + Enter adds a new line"
        status="Context attached"
        value="Summarize the errors"
      />,
    );

    expect(screen.getByText("Shift + Enter adds a new line")).toBeVisible();
    expect(screen.getByText("Context attached")).toBeVisible();
  });

  it("forwards textarea value changes", () => {
    const handleValueChange = vi.fn();

    render(<AIChatInput onValueChange={handleValueChange} value="Hello" />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Hello again" },
    });

    expect(handleValueChange).toHaveBeenCalledWith("Hello again");
  });

  it("disables submit when no message is provided", () => {
    render(<AIChatInput value="   " />);

    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("gives the textarea a default accessible name", () => {
    render(<AIChatInput value="" />);

    expect(
      screen.getByRole("textbox", { name: "Chat message" }),
    ).toBeInTheDocument();
  });

  it("lets consumers override the textarea accessible name", () => {
    render(<AIChatInput inputLabel="Ask the assistant" value="" />);

    expect(
      screen.getByRole("textbox", { name: "Ask the assistant" }),
    ).toBeInTheDocument();
  });
});
