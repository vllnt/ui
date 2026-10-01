import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListBox, ListBoxItem } from "./list-box";

describe("ListBox", () => {
  it("renders labelled options and selects a single value on click", () => {
    const onValueChange = vi.fn();
    const { getAllByRole, getByRole, getByText } = render(
      <ListBox label="Fruit" onValueChange={onValueChange}>
        <ListBoxItem value="apple">Apple</ListBoxItem>
        <ListBoxItem value="banana">Banana</ListBoxItem>
      </ListBox>,
    );
    expect(getByRole("listbox", { name: "Fruit" })).toBeInTheDocument();
    expect(getAllByRole("option")).toHaveLength(2);
    fireEvent.click(getByText("Banana"));
    expect(onValueChange).toHaveBeenCalledWith(["banana"]);
  });

  it("marks the default value as selected and accumulates in multiple mode", () => {
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
    expect(getByText("Apple").closest("[role='option']")).toHaveAttribute(
      "aria-selected",
      "true",
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
