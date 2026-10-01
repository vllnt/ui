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

function tabStops(options: HTMLElement[]): HTMLElement[] {
  return options.filter((option) => option.getAttribute("tabindex") === "0");
}

describe("ListBox keyboard (WAI-ARIA APG listbox pattern)", () => {
  it("has one tab stop, on the selected option", () => {
    const { getAllByRole, getByRole } = render(
      <ListBox defaultValue={["pst"]} label="Timezone">
        <ListBoxItem value="utc">UTC</ListBoxItem>
        <ListBoxItem value="est">Eastern</ListBoxItem>
        <ListBoxItem value="pst">Pacific</ListBoxItem>
      </ListBox>,
    );
    expect(tabStops(getAllByRole("option"))).toEqual([
      getByRole("option", { name: "Pacific" }),
    ]);
  });

  it("has one tab stop, on the first enabled option, when nothing or several are selected", () => {
    const { getAllByRole, getByRole, rerender } = render(
      <ListBox label="Frameworks" selectionMode="multiple">
        <ListBoxItem disabled value="angular">
          Angular
        </ListBoxItem>
        <ListBoxItem value="react">React</ListBoxItem>
        <ListBoxItem value="vue">Vue</ListBoxItem>
      </ListBox>,
    );
    expect(tabStops(getAllByRole("option"))).toEqual([
      getByRole("option", { name: "React" }),
    ]);
    rerender(
      <ListBox
        label="Frameworks"
        selectionMode="multiple"
        value={["vue", "react"]}
      >
        <ListBoxItem disabled value="angular">
          Angular
        </ListBoxItem>
        <ListBoxItem value="react">React</ListBoxItem>
        <ListBoxItem value="vue">Vue</ListBoxItem>
      </ListBox>,
    );
    expect(tabStops(getAllByRole("option"))).toHaveLength(1);
  });

  it("moves focus with ArrowDown / ArrowUp / Home / End, skipping disabled options", () => {
    const { getByRole } = render(
      <ListBox label="Frameworks" selectionMode="multiple">
        <ListBoxItem value="react">React</ListBoxItem>
        <ListBoxItem disabled value="angular">
          Angular
        </ListBoxItem>
        <ListBoxItem value="vue">Vue</ListBoxItem>
        <ListBoxItem value="svelte">Svelte</ListBoxItem>
      </ListBox>,
    );
    const react = getByRole("option", { name: "React" });
    react.focus();
    fireEvent.keyDown(react, { key: "ArrowDown" });
    const vue = getByRole("option", { name: "Vue" });
    expect(vue).toHaveFocus();
    expect(vue).toHaveAttribute("tabindex", "0");
    expect(react).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(vue, { key: "End" });
    expect(getByRole("option", { name: "Svelte" })).toHaveFocus();
    fireEvent.keyDown(getByRole("option", { name: "Svelte" }), {
      key: "Home",
    });
    expect(react).toHaveFocus();
    fireEvent.keyDown(react, { key: "ArrowUp" });
    expect(react).toHaveFocus();
  });
});
