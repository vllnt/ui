import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchField } from "./search-field";

describe("SearchField", () => {
  describe("rendering", () => {
    it("renders a search input", () => {
      const { getByRole } = render(<SearchField />);

      expect(getByRole("searchbox")).toBeInTheDocument();
    });

    it("uses a custom placeholder", () => {
      const { getByPlaceholderText } = render(
        <SearchField placeholder="Find users" />,
      );

      expect(getByPlaceholderText("Find users")).toBeInTheDocument();
    });
  });

  describe("typing", () => {
    it("calls onValueChange when the user types", () => {
      const onValueChange = vi.fn();
      const { getByRole } = render(
        <SearchField onValueChange={onValueChange} />,
      );

      fireEvent.change(getByRole("searchbox"), { target: { value: "abc" } });

      expect(onValueChange).toHaveBeenCalledWith("abc");
    });
  });

  describe("clearing", () => {
    it("shows a clear button and resets the value", () => {
      const onValueChange = vi.fn();
      const { getByLabelText, getByRole } = render(
        <SearchField defaultValue="query" onValueChange={onValueChange} />,
      );

      fireEvent.click(getByLabelText("Clear search"));

      expect(onValueChange).toHaveBeenCalledWith("");
      expect(getByRole("searchbox")).toHaveValue("");
    });

    it("hides the clear button when empty", () => {
      const { queryByLabelText } = render(<SearchField />);

      expect(queryByLabelText("Clear search")).not.toBeInTheDocument();
    });
  });
});
