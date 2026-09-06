import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Text as NativeText } from "react-native";

import { ThemeProvider } from "../theme/theme-provider";

import { Button } from "./button/button";
import { ButtonGroup } from "./button-group/button-group";
import { CategoryFilter } from "./category-filter/category-filter";
import { CheckboxGroup } from "./checkbox-group/checkbox-group";
import { ColorPicker } from "./color-picker/color-picker";
import { Combobox } from "./combobox/combobox";
import { DatePicker } from "./date-picker/date-picker";
import { DateRangePicker } from "./date-range-picker/date-range-picker";
import { FilterBar } from "./filter-bar/filter-bar";
import { Form, FormSubmit } from "./form/form";
import { ListBox } from "./list-box/list-box";
import { NativeSelect } from "./native-select/native-select";
import { SegmentedControl } from "./segmented-control/segmented-control";
import { TagGroup } from "./tag-group/tag-group";
import { TagsInput } from "./tags-input/tags-input";
import { TimePicker } from "./time-picker/time-picker";

const calendarLabels = {
  close: "Close picker",
  formatDayAccessibilityLabel: (date: Date) =>
    `Choose ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  formatMonth: (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`,
  formatValue: (date: Date) => date.toISOString().slice(0, 10),
  formatWeekday: (weekday: number) =>
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday] ?? "",
  nextMonth: "Next month",
  open: "Choose date",
  placeholder: "No date",
  previousMonth: "Previous month",
};

const selectLabels = {
  close: "Close choices",
  open: "Choose status",
  options: "Status choices",
  placeholder: "No status",
};

function themed(element: ReactElement) {
  return <ThemeProvider colorScheme="light">{element}</ThemeProvider>;
}

describe("previously unmounted native component families", () => {
  it("mounts grouped controls and preserves stable selection callbacks", () => {
    const onCategory = jest.fn();
    const onChecks = jest.fn();
    const onColor = jest.fn();
    const onList = jest.fn();
    const onSegment = jest.fn();
    const onTags = jest.fn();
    const onRemove = jest.fn();

    render(
      themed(
        <>
          <ButtonGroup label="Editing actions">
            <Button accessibilityLabel="Save changes" onPress={jest.fn()}>
              Save
            </Button>
          </ButtonGroup>
          <FilterBar label="Filters">
            <NativeText>Active filters</NativeText>
          </FilterBar>
          <CategoryFilter
            categories={[
              { id: "all", label: "All" },
              { id: "open", label: "Open" },
            ]}
            label="Category"
            selection={{
              defaultValue: "all",
              mode: "uncontrolled",
              onChange: onCategory,
            }}
          />
          <CheckboxGroup
            items={[{ id: "email", label: "Email" }]}
            label="Channels"
            selection={{
              defaultValue: new Set(),
              mode: "uncontrolled",
              onChange: onChecks,
            }}
          />
          <ColorPicker
            colors={[{ color: "#ff0000", id: "red", label: "Red" }]}
            label="Accent color"
            selection={{
              defaultValue: "",
              mode: "uncontrolled",
              onChange: onColor,
            }}
          />
          <ListBox
            label="Assignees"
            options={[{ id: "ada", label: "Ada" }]}
            selection={{
              defaultValue: new Set(),
              mode: "uncontrolled",
              onChange: onList,
            }}
          />
          <SegmentedControl
            items={[
              { id: "grid", label: "Grid" },
              { id: "list", label: "List" },
            ]}
            label="Layout"
            selection={{
              defaultValue: "grid",
              mode: "uncontrolled",
              onChange: onSegment,
            }}
          />
          <TagGroup
            items={[{ id: "native", label: "Native" }]}
            label="Platforms"
            onRemove={onRemove}
            removeLabel={(label) => `Remove ${label}`}
            selection={{
              defaultValue: new Set(),
              mode: "uncontrolled",
              onChange: onTags,
            }}
          />
        </>,
      ),
    );

    expect(screen.getByLabelText("Editing actions")).toBeOnTheScreen();
    expect(screen.getByLabelText("Filters")).toHaveProp(
      "accessibilityRole",
      "toolbar",
    );
    fireEvent.press(screen.getByRole("radio", { name: "Open" }));
    fireEvent.press(screen.getByRole("checkbox", { name: "Email" }));
    fireEvent.press(screen.getByRole("radio", { name: "Red" }));
    fireEvent.press(screen.getByRole("radio", { name: "Ada" }));
    fireEvent.press(screen.getByRole("radio", { name: "List" }));
    fireEvent.press(screen.getByRole("button", { name: "Native" }));
    fireEvent.press(screen.getByRole("button", { name: "Remove Native" }));

    expect(onCategory).toHaveBeenCalledWith("open");
    expect([...onChecks.mock.calls[0][0]]).toEqual(["email"]);
    expect(onColor).toHaveBeenCalledWith("red");
    expect([...onList.mock.calls[0][0]]).toEqual(["ada"]);
    expect(onSegment).toHaveBeenCalledWith("list");
    expect([...onTags.mock.calls[0][0]]).toEqual(["native"]);
    expect(onRemove).toHaveBeenCalledWith("native");
  });

  it("reports current values on native picker triggers", () => {
    render(
      themed(
        <>
          <Combobox
            labels={{
              ...selectLabels,
              close: "Close searchable choices",
              empty: "No matches",
              search: "Search statuses",
            }}
            options={[{ id: "ready", label: "Ready" }]}
            selection={{ defaultValue: "ready", mode: "uncontrolled" }}
          />
          <DatePicker
            labels={calendarLabels}
            selection={{
              defaultValue: new Date("2025-01-02T12:00:00Z"),
              mode: "uncontrolled",
            }}
          />
          <DateRangePicker
            labels={{
              ...calendarLabels,
              close: "Close range",
              formatValue: (range) =>
                `${range.start.getDate()} to ${range.end?.getDate() ?? ""}`,
              open: "Choose range",
              placeholder: "No range",
            }}
            range={{
              defaultValue: {
                end: new Date(2025, 0, 4),
                start: new Date(2025, 0, 2),
              },
              mode: "uncontrolled",
            }}
          />
        </>,
      ),
    );

    expect(screen.getByRole("button", { name: "Choose status" })).toHaveProp(
      "accessibilityValue",
      { text: "Ready" },
    );
    expect(screen.getByRole("button", { name: "Choose date" })).toHaveProp(
      "accessibilityValue",
      { text: "2025-01-02" },
    );
    expect(screen.getByRole("button", { name: "Choose range" })).toHaveProp(
      "accessibilityValue",
      { text: "2 to 4" },
    );
  });

  it("opens and closes each native picker surface", () => {
    const pickers = [
      {
        close: "Close searchable choices",
        element: (
          <Combobox
            labels={{
              ...selectLabels,
              close: "Close searchable choices",
              empty: "No matches",
              search: "Search statuses",
            }}
            options={[{ id: "ready", label: "Ready" }]}
            selection={{ defaultValue: undefined, mode: "uncontrolled" }}
          />
        ),
        open: "Choose status",
      },
      {
        close: "Close choices",
        element: (
          <NativeSelect
            labels={selectLabels}
            options={[{ id: "ready", label: "Ready" }]}
            selection={{ defaultValue: undefined, mode: "uncontrolled" }}
          />
        ),
        open: "Choose status",
      },
      {
        close: "Close picker",
        element: (
          <DatePicker
            labels={calendarLabels}
            selection={{ defaultValue: undefined, mode: "uncontrolled" }}
          />
        ),
        open: "Choose date",
      },
      {
        close: "Close range",
        element: (
          <DateRangePicker
            labels={{
              ...calendarLabels,
              close: "Close range",
              formatValue: (range) =>
                `${range.start.toISOString()} to ${range.end?.toISOString() ?? ""}`,
              open: "Choose range",
              placeholder: "No range",
            }}
            range={{ defaultValue: undefined, mode: "uncontrolled" }}
          />
        ),
        open: "Choose range",
      },
      {
        close: "Close time",
        element: (
          <TimePicker
            labels={{
              close: "Close time",
              hour: "Hour",
              minute: "Minute",
              open: "Choose time",
              placeholder: "No time",
            }}
            selection={{ defaultValue: undefined, mode: "uncontrolled" }}
          />
        ),
        open: "Choose time",
      },
    ];

    pickers.forEach((picker) => {
      const view = render(themed(picker.element));
      fireEvent.press(screen.getByRole("button", { name: picker.open }));
      const close = screen.getByRole("button", { name: picker.close });
      expect(close).toBeOnTheScreen();
      fireEvent.press(close);
      view.unmount();
    });
  });

  it("composes tag submission callbacks and explicit form submission", () => {
    const onTagsChange = jest.fn();
    const onSubmitEditing = jest.fn();
    const onSubmit = jest.fn();
    render(
      themed(
        <Form label="Profile" onSubmit={onSubmit}>
          <TagsInput
            labels={{
              add: "Add tag",
              input: "Tags",
              remove: (tag) => `Remove ${tag}`,
            }}
            onSubmitEditing={onSubmitEditing}
            tags={{
              defaultValue: [],
              mode: "uncontrolled",
              onChange: onTagsChange,
            }}
          />
          <FormSubmit>Save profile</FormSubmit>
        </Form>,
      ),
    );

    const input = screen
      .UNSAFE_getAllByProps({ accessibilityLabel: "Tags" })
      .find((element) => element.props.onChangeText !== undefined);
    expect(input).toBeDefined();
    if (!input) return;
    fireEvent.changeText(input, "native");
    fireEvent(input, "submitEditing", { nativeEvent: { text: "native" } });
    fireEvent.press(screen.getByRole("button", { name: "Save profile" }));

    expect(onTagsChange).toHaveBeenCalledWith(["native"]);
    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
