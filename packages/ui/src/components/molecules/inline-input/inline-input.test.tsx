import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { InlineInput } from "./inline-input";

it("InlineInput renders a visible root that applies custom className", () => {
  const { container } = render(<InlineInput className="custom-class" />);
  expect(container.firstChild).toBeVisible();
  expect(container.firstChild).toHaveClass("custom-class");
});

it("InlineInput forwards an accessible name to the input", () => {
  render(
    <>
      <span id="rename-label">File name</span>
      <InlineInput
        aria-labelledby="rename-label"
        onChange={vi.fn()}
        onCommit={vi.fn()}
        value="notes.md"
      />
      <InlineInput
        aria-label="Folder name"
        onChange={vi.fn()}
        onCommit={vi.fn()}
        value="docs"
      />
    </>,
  );
  expect(screen.getByRole("textbox", { name: "File name" })).toHaveValue(
    "notes.md",
  );
  expect(screen.getByRole("textbox", { name: "Folder name" })).toHaveValue(
    "docs",
  );
});

it("InlineInput focuses on mount and does not refocus after re-render once blurred", () => {
  const onCommit = vi.fn();
  const { rerender } = render(
    <InlineInput onChange={vi.fn()} onCommit={onCommit} value="a" />,
  );
  const input = screen.getByRole("textbox");

  expect(input).toHaveFocus();

  fireEvent.blur(input);
  input.blur();
  rerender(<InlineInput onChange={vi.fn()} onCommit={onCommit} value="ab" />);

  expect(input).not.toHaveFocus();
});
