import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListBox, ListBoxItem } from "./list-box";

describe("ListBox", () => {
  describe("rendering", () => {
    it("renders options inside a listbox", () => {
      const { getAllByRole, getByRole } = render(
        <ListBox label="Fruit">
          <ListBoxItem value="apple">Apple</ListBoxItem>
          <ListBoxItem value="banana">Banana</ListBoxItem>
        </ListBox>,
      );

      expect(getByRole("listbox", { name: "Fruit" })).toBeInTheDocument();
      expect(getAllByRole("option")).toHaveLength(2);
    });

    it("marks the default value as selected", () => {
      const { getByRole } = render(
        <ListBox defaultValue={["apple"]}>
          <ListBoxItem value="apple">Apple</ListBoxItem>
        </ListBox>,
      );

      expect(getByRole("option")).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("selection", () => {
    it("selects a single value on click", () => {
      const onValueChange = vi.fn();
      const { getByText } = render(
        <ListBox onValueChange={onValueChange}>
          <ListBoxItem value="apple">Apple</ListBoxItem>
          <ListBoxItem value="banana">Banana</ListBoxItem>
        </ListBox>,
      );

      fireEvent.click(getByText("Banana"));

      expect(onValueChange).toHaveBeenCalledWith(["banana"]);
    });

    it("accumulates values in multiple mode", () => {
      const onValueChange = vi.fn();
      const { getByText } = render(
        <ListBox
          defaultValue={["apple"]}
          onValueChange={onValueChange}
          selectionMode="multiple"
        >
          <ListBoxItem value="apple">Apple</ListBoxItem>
          <ListBoxItem value="banana">Banana</ListBoxItem>
        </ListBox>,
      );

      fireEvent.click(getByText("Banana"));

      expect(onValueChange).toHaveBeenCalledWith(["apple", "banana"]);
    });

    it("selects with the keyboard", () => {
      const onValueChange = vi.fn();
      const { getByText } = render(
        <ListBox onValueChange={onValueChange}>
          <ListBoxItem value="apple">Apple</ListBoxItem>
        </ListBox>,
      );

      fireEvent.keyDown(getByText("Apple"), { key: "Enter" });

      expect(onValueChange).toHaveBeenCalledWith(["apple"]);
    });
  });
});
