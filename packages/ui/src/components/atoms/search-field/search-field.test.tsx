import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchField } from "./search-field";

describe("SearchField", () => {
  it("renders an empty searchbox with no clear button", () => {
    const { getByRole, queryByLabelText } = render(<SearchField />);
    expect(getByRole("searchbox")).toBeInTheDocument();
    expect(queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("uses a custom placeholder and calls onValueChange when the user types", () => {
    const onValueChange = vi.fn();
    const { getByPlaceholderText } = render(
      <SearchField onValueChange={onValueChange} placeholder="Find users" />,
    );
    fireEvent.change(getByPlaceholderText("Find users"), {
      target: { value: "abc" },
    });
    expect(onValueChange).toHaveBeenCalledWith("abc");
  });

  it("shows a clear button and resets the value", () => {
    const onValueChange = vi.fn();
    const { getByLabelText, getByRole } = render(
      <SearchField defaultValue="query" onValueChange={onValueChange} />,
    );
    fireEvent.click(getByLabelText("Clear search"));
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(getByRole("searchbox")).toHaveValue("");
  });
});

describe("SearchField clear button", () => {
  it("has a 24px minimum target", () => {
    render(<SearchField defaultValue="docs" />);
    expect(screen.getByRole("button", { name: "Clear search" })).toHaveClass(
      "size-6",
    );
  });
});
