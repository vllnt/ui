import { fireEvent, render, screen } from "@testing-library/react-native";

import { DatePicker } from "./date-picker";

it("disables an already-open calendar without trapping dismissal", () => {
  const onChange = jest.fn();
  const props = {
    labels: {
      close: "Close",
      formatDayAccessibilityLabel: (date: Date) => `Day ${date.getDate()}`,
      formatMonth: () => "Month",
      formatValue: () => "Date",
      formatWeekday: String,
      nextMonth: "Next month",
      open: "Open",
      placeholder: "Choose",
      previousMonth: "Previous month",
    },
    selection: { defaultValue: undefined, mode: "uncontrolled", onChange },
  } satisfies React.ComponentProps<typeof DatePicker>;
  render(<DatePicker {...props} />);
  fireEvent.press(screen.getByRole("button", { name: "Open" }));
  screen.rerender(<DatePicker {...props} disabled />);
  expect(screen.getByRole("button", { name: "Day 1" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "Day 1" }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("button", { name: "Day 1" })).toBeNull();
});
