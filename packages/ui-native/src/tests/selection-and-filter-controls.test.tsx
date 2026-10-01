import { fireEvent, screen } from "@testing-library/react-native";
import { Text as NativeText } from "react-native";

import { Button } from "../components/atoms/button/button";
import { ButtonGroup } from "../components/atoms/button-group/button-group";
import { CheckboxGroup } from "../components/atoms/checkbox-group/checkbox-group";
import { ColorPicker } from "../components/atoms/color-picker/color-picker";
import { FilterBar } from "../components/atoms/filter-bar/filter-bar";
import { Form, FormSubmit } from "../components/atoms/form/form";
import { ListBox } from "../components/atoms/list-box/list-box";
import { SegmentedControl } from "../components/atoms/segmented-control/segmented-control";
import { TagGroup } from "../components/atoms/tag-group/tag-group";
import { TagsInput } from "../components/atoms/tags-input/tags-input";
import { CategoryFilter } from "../components/molecules/category-filter/category-filter";
import { Combobox } from "../components/molecules/combobox/combobox";
import { DatePicker } from "../components/molecules/date-picker/date-picker";
import { NativeSelect } from "../components/molecules/native-select/native-select";
import { DateRangePicker } from "../components/organisms/date-range-picker/date-range-picker";
import { TimePicker } from "../components/organisms/time-picker/time-picker";

import { renderThemed } from "./test-utils";

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
const comboboxLabels = {
  ...selectLabels,
  close: "Close searchable choices",
  empty: "No matches",
  search: "Search statuses",
};

function uncontrolled<T>(defaultValue: T, onChange: jest.Mock) {
  return { defaultValue, mode: "uncontrolled" as const, onChange };
}

it("mounts grouped controls and preserves stable selection callbacks", () => {
  const onCategory = jest.fn();
  const onChecks = jest.fn();
  const onColor = jest.fn();
  const onList = jest.fn();
  const onSegment = jest.fn();
  const onTags = jest.fn();
  const onRemove = jest.fn();

  renderThemed(
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
        selection={uncontrolled("all", onCategory)}
      />
      <CheckboxGroup
        items={[{ id: "email", label: "Email" }]}
        label="Channels"
        selection={uncontrolled(new Set<string>(), onChecks)}
      />
      <ColorPicker
        colors={[{ color: "#ff0000", id: "red", label: "Red" }]}
        label="Accent color"
        selection={uncontrolled("", onColor)}
      />
      <ListBox
        label="Assignees"
        options={[{ id: "ada", label: "Ada" }]}
        selection={uncontrolled(new Set<string>(), onList)}
      />
      <SegmentedControl
        items={[
          { id: "grid", label: "Grid" },
          { id: "list", label: "List" },
        ]}
        label="Layout"
        selection={uncontrolled("grid", onSegment)}
      />
      <TagGroup
        items={[{ id: "native", label: "Native" }]}
        label="Platforms"
        onRemove={onRemove}
        removeLabel={(label) => `Remove ${label}`}
        selection={uncontrolled(new Set<string>(), onTags)}
      />
    </>,
  );
  expect(screen.getByRole("button", { name: "Save changes" })).toHaveProp(
    "accessibilityHint",
    "Editing actions",
  );
  expect(screen.queryByLabelText("Filters")).toBeNull();
  fireEvent.press(screen.getByRole("radio", { name: "Open" }));
  fireEvent.press(screen.getByRole("checkbox", { name: "Email" }));
  fireEvent.press(screen.getByRole("radio", { name: "Red" }));
  fireEvent.press(screen.getByRole("radio", { name: "Ada" }));
  fireEvent.press(screen.getByRole("radio", { name: "List" }));
  expect(screen.getByRole("togglebutton", { name: "Native" })).toHaveProp(
    "accessibilityHint",
    "Platforms",
  );
  fireEvent.press(screen.getByRole("togglebutton", { name: "Native" }));
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
  renderThemed(
    <>
      <Combobox
        labels={comboboxLabels}
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
  );
  for (const [name, text] of [
    ["Choose status", "Ready"],
    ["Choose date", "2025-01-02"],
    ["Choose range", "2 to 4"],
  ])
    expect(screen.getByRole("button", { name })).toHaveProp(
      "accessibilityValue",
      { text },
    );
});

it("opens and closes each native picker surface", () => {
  const empty = { defaultValue: undefined, mode: "uncontrolled" } as const;
  const pickers = [
    {
      close: "Close searchable choices",
      element: (
        <Combobox
          labels={comboboxLabels}
          options={[{ id: "ready", label: "Ready" }]}
          selection={empty}
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
          selection={empty}
        />
      ),
      open: "Choose status",
    },
    {
      close: "Close picker",
      element: <DatePicker labels={calendarLabels} selection={empty} />,
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
          range={empty}
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
          selection={empty}
        />
      ),
      open: "Choose time",
    },
  ];

  pickers.forEach((picker) => {
    const view = renderThemed(picker.element);
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
  renderThemed(
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
