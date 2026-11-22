import { fireEvent, render, screen } from "@testing-library/react-native";
import { FlatList } from "react-native";

import { ContextMenu } from "../components/atoms/context-menu/context-menu";
import { KeyboardShortcutsHelp } from "../components/atoms/keyboard-shortcuts-help/keyboard-shortcuts-help";
import { Select } from "../components/atoms/select/select";
import { Combobox } from "../components/molecules/combobox/combobox";
import { MultiSelect } from "../components/molecules/multi-select/multi-select";

// More rows than FlatList mounts by default (10), so a windowed list fails.
const ROWS = 40;
const rows = Array.from({ length: ROWS }, (_, index) => ({
  id: `row-${(index + 1).toString()}`,
  label: `Row ${(index + 1).toString()}`,
}));
const hostNode = () => ({ measure: jest.fn() });
const pickerLabels = {
  close: "Done",
  empty: "No rows",
  open: "Rows",
  options: "Row options",
  placeholder: "Pick",
  results: (count: number) => `${count.toString()} rows`,
  search: "Search rows",
};

function expectEveryListKeepsRowsAttached() {
  expect(screen.UNSAFE_getByType(FlatList).props).toMatchObject({
    removeClippedSubviews: false,
  });
}

describe("overlay lists keep every row reachable by screen readers", () => {
  it("Select mounts all options", () => {
    render(
      <Select
        labels={pickerLabels}
        options={rows}
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Rows" }));
    expect(screen.getAllByRole("radio")).toHaveLength(ROWS);
    expect(screen.getByRole("radio", { name: "Row 40" })).toBeOnTheScreen();
    expectEveryListKeepsRowsAttached();
  });

  it("Combobox mounts all options", () => {
    render(
      <Combobox
        labels={pickerLabels}
        options={rows}
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Rows" }));
    expect(screen.getAllByRole("radio")).toHaveLength(ROWS);
    expect(screen.getByRole("radio", { name: "Row 40" })).toBeOnTheScreen();
    expectEveryListKeepsRowsAttached();
  });

  it("MultiSelect mounts all options", () => {
    render(
      <MultiSelect
        labels={pickerLabels}
        options={rows}
        searchable
        selection={{ defaultValue: new Set<string>(), mode: "uncontrolled" }}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Rows" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(ROWS);
    expect(screen.getByRole("checkbox", { name: "Row 40" })).toBeOnTheScreen();
    expectEveryListKeepsRowsAttached();
  });

  it("ContextMenu mounts all items", () => {
    render(
      <ContextMenu
        cancelLabel="Cancel"
        defaultOpen
        items={rows}
        label="Row actions"
      />,
      { createNodeMock: hostNode },
    );
    expect(screen.getAllByRole("menuitem")).toHaveLength(ROWS);
    expect(screen.getByRole("menuitem", { name: "Row 40" })).toBeOnTheScreen();
    expectEveryListKeepsRowsAttached();
  });

  it("KeyboardShortcutsHelp mounts all shortcuts", () => {
    render(
      <KeyboardShortcutsHelp
        defaultOpen
        labels={{
          close: "Close keyboard help",
          hardwareKeyboardGuidance: "Available with a hardware keyboard.",
          title: "Hardware keyboard",
        }}
        shortcuts={rows.map((row) => ({
          description: row.label,
          id: row.id,
          keys: ["Tab"],
        }))}
      />,
    );
    for (const row of rows)
      expect(screen.getByLabelText(`${row.label}: Tab`)).toBeOnTheScreen();
    expectEveryListKeepsRowsAttached();
  });
});
