import { fireEvent, render, screen } from "@testing-library/react-native";

import { Combobox } from "./combobox";

it("locks open options and search when disabled, while retaining dismissal", () => {
  const onChange = jest.fn();
  const props = {
    labels: {
      close: "Close",
      empty: "Empty",
      open: "Open",
      options: "Options",
      placeholder: "Choose",
      search: "Search",
    },
    options: [{ id: "a", label: "Alpha" }],
    selection: { defaultValue: undefined, mode: "uncontrolled", onChange },
  } satisfies React.ComponentProps<typeof Combobox>;
  render(<Combobox {...props} />);
  fireEvent.press(screen.getByRole("button", { name: "Open" }));
  screen.rerender(<Combobox {...props} disabled />);
  expect(screen.getByRole("radio", { name: "Alpha" })).toBeDisabled();
  expect(screen.getByLabelText("Search")).toHaveProp("editable", false);
  fireEvent.press(screen.getByRole("radio", { name: "Alpha" }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("radio")).toBeNull();
});
