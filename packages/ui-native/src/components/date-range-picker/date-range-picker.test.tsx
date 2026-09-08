import { fireEvent, render, screen } from "@testing-library/react-native";

import { DateRangePicker } from "./date-range-picker";

it("disables an already-open range calendar while preserving its range", () => {
  const onChange = jest.fn();
  const props = {
    labels: {
      close: "Close",
      formatDayAccessibilityLabel: (date: Date) => `Day ${date.getDate()}`,
      formatMonth: () => "Month",
      formatValue: () => "Range",
      formatWeekday: String,
      nextMonth: "Next month",
      open: "Open",
      placeholder: "Choose",
      previousMonth: "Previous month",
    },
    range: { defaultValue: undefined, mode: "uncontrolled", onChange },
  } satisfies React.ComponentProps<typeof DateRangePicker>;
  render(<DateRangePicker {...props} />);
  fireEvent.press(screen.getByRole("button", { name: "Open" }));
  screen.rerender(<DateRangePicker {...props} disabled />);
  expect(screen.getByRole("button", { name: "Day 1" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "Day 1" }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("button", { name: "Day 1" })).toBeNull();
});
