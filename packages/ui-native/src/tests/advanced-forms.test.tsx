import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { FileUpload } from "../components/atoms/file-upload/file-upload";
import { InputOTP } from "../components/atoms/input-otp/input-otp";
import { Select } from "../components/atoms/select/select";
import { DateField } from "../components/molecules/date-field/date-field";
import { MultiSelect } from "../components/molecules/multi-select/multi-select";
import { RangeCalendar } from "../components/molecules/range-calendar/range-calendar";
import type { FilePickerService } from "../primitives/platform-services";

import { renderThemed, themed } from "./test-utils";

const selectLabels = {
  close: "Close choices",
  open: "Choose status",
  options: "Status choices",
  placeholder: "Choose a status",
};

const calendarLabels = {
  formatDayAccessibilityLabel: (date: Date) =>
    `Choose ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  formatMonth: (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`,
  formatWeekday: (weekday: number) =>
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday] ?? "",
  nextMonth: "Next month",
  previousMonth: "Previous month",
};

const uploadLabels = {
  choose: "Choose files",
  empty: "No files selected",
  failed: "Files could not be selected",
  remove: (name: string) => `Remove ${name}`,
  unavailable: "File selection is unavailable",
};

it("selects one option from a native modal list", () => {
  const onChange = jest.fn();
  renderThemed(
    <Select
      labels={selectLabels}
      options={[
        { id: "draft", label: "Draft" },
        { id: "ready", label: "Ready" },
      ]}
      selection={{ defaultValue: undefined, mode: "uncontrolled", onChange }}
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "Choose status" }));
  fireEvent.press(screen.getByRole("radio", { name: "Ready" }));
  expect(onChange).toHaveBeenCalledWith("ready");
  expect(screen.getByText("Ready")).toBeOnTheScreen();
});

it("toggles stable IDs in a multiple selection", () => {
  const onChange = jest.fn();
  renderThemed(
    <MultiSelect
      labels={{
        ...selectLabels,
        empty: "No matches",
        search: "Search choices",
      }}
      options={[
        { id: "alpha", label: "Alpha" },
        { id: "beta", label: "Beta" },
      ]}
      selection={{
        defaultValue: new Set(["alpha"]),
        mode: "uncontrolled",
        onChange,
      }}
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "Choose status" }));
  fireEvent.press(screen.getByRole("checkbox", { name: "Beta" }));
  expect([...onChange.mock.calls[0][0]]).toEqual(["alpha", "beta"]);
});

it("announces invalid date text, composes submission, and accepts numeric OTP input", () => {
  const onDateChange = jest.fn();
  const onDateSubmit = jest.fn();
  const onCodeChange = jest.fn();
  renderThemed(
    <>
      <DateField
        labels={{
          error: "Enter a valid date",
          input: "Start date",
          placeholder: "YYYY-MM-DD",
        }}
        onSubmitEditing={onDateSubmit}
        valueState={{
          defaultValue: undefined,
          mode: "uncontrolled",
          onChange: onDateChange,
        }}
      />
      <InputOTP
        accessibilityLabel="Security code"
        length={6}
        valueState={{
          defaultValue: "",
          mode: "uncontrolled",
          onChange: onCodeChange,
        }}
      />
    </>,
  );
  fireEvent.changeText(screen.getByLabelText("Start date"), "2025-02-31");
  fireEvent(screen.getByLabelText("Start date"), "submitEditing", {
    nativeEvent: { text: "2025-02-31" },
  });
  expect(onDateSubmit).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("alert", { name: "Enter a valid date" }),
  ).toBeOnTheScreen();
  expect(onDateChange).not.toHaveBeenCalled();

  fireEvent.changeText(screen.getByLabelText("Security code"), "12a34567");
  expect(onCodeChange).toHaveBeenCalledWith("123456");
});

it("builds an ordered date range from two native calendar choices", () => {
  const onChange = jest.fn();
  renderThemed(
    <RangeCalendar
      labels={calendarLabels}
      month={new Date(2025, 0, 1)}
      range={{ defaultValue: undefined, mode: "uncontrolled", onChange }}
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "Choose 2025-1-20" }));
  fireEvent.press(screen.getByRole("button", { name: "Choose 2025-1-10" }));
  const range = onChange.mock.calls[1][0];
  expect(range.start.getDate()).toBe(10);
  expect(range.end.getDate()).toBe(20);
});

it("exposes unavailable and injected file-picker behavior", async () => {
  const onFilesChange = jest.fn();
  const notes = { name: "notes.txt", uri: "file:///notes.txt" };
  const picker: FilePickerService = { pickFiles: jest.fn(async () => [notes]) };
  const view = renderThemed(
    <FileUpload
      files={{ defaultValue: [], mode: "uncontrolled" }}
      labels={uploadLabels}
    />,
  );
  expect(
    screen.getByRole("button", { name: "File selection is unavailable" }),
  ).toBeDisabled();

  view.rerender(
    themed(
      <FileUpload
        filePicker={picker}
        files={{
          defaultValue: [],
          mode: "uncontrolled",
          onChange: onFilesChange,
        }}
        labels={uploadLabels}
      />,
    ),
  );
  fireEvent.press(screen.getByRole("button", { name: "Choose files" }));
  await waitFor(() => {
    expect(onFilesChange).toHaveBeenCalledWith([notes]);
    expect(screen.getByText("notes.txt")).toBeOnTheScreen();
  });
});
