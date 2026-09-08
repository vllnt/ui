import { fireEvent, render, screen } from "@testing-library/react-native";

import { SearchField } from "../components/search-field/search-field";
import { Slider } from "../components/slider/slider";
import { StatusBoard } from "../components/status-board/status-board";
import { Stepper } from "../components/stepper/stepper";
import { TimePicker } from "../components/time-picker/time-picker";
import { ToolbarButton } from "../components/toolbar/toolbar";
import { Tour } from "../components/tour/tour";

const steps = [
  { description: null, id: "one", title: "One" },
  { description: null, id: "two", title: "Two" },
];
const tourLabels = {
  finish: "Finish",
  goToStep: (step: { title: string }) => step.title,
  hint: "Hint",
  next: "Next",
  previous: "Previous",
  stepProgress: (current: number, total: number) => `${current}/${total}`,
  tour: "Tour",
};

describe("S–Z individual review regressions", () => {
  it("normalizes uncontrolled slider state when bounds change", () => {
    const onValueChange = jest.fn();
    render(
      <Slider
        accessibilityLabel="Volume"
        defaultValue={80}
        max={100}
        onValueChange={onValueChange}
      />,
    );
    screen.rerender(
      <Slider
        accessibilityLabel="Volume"
        defaultValue={80}
        max={20}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("adjustable")).toHaveProp("accessibilityValue", {
      max: 20,
      min: 0,
      now: 20,
      text: undefined,
    });
    fireEvent(screen.getByRole("adjustable"), "accessibilityAction", {
      nativeEvent: { actionName: "decrement" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith(19);
  });

  it("keeps an uncontrolled tour visible when its steps shrink", () => {
    render(<Tour defaultCurrentStep={1} labels={tourLabels} steps={steps} />);
    screen.rerender(
      <Tour
        defaultCurrentStep={1}
        labels={tourLabels}
        steps={steps.slice(0, 1)}
      />,
    );
    expect(screen.getByRole("header", { name: "One" })).toBeOnTheScreen();
    expect(screen.getByRole("progressbar")).toHaveProp("accessibilityValue", {
      max: 1,
      min: 1,
      now: 1,
      text: "1/1",
    });
  });

  it("keeps a current step when an uncontrolled stepper shrinks", () => {
    const items = steps.map(({ id, title }) => ({ id, title }));
    const labels = {
      step: (step: { title: string }) => step.title,
      stepper: "Steps",
    };
    render(<Stepper defaultCurrentStep={2} labels={labels} steps={items} />);
    screen.rerender(
      <Stepper
        defaultCurrentStep={2}
        labels={labels}
        steps={items.slice(0, 1)}
      />,
    );
    expect(screen.getByRole("button", { name: "One" })).toHaveProp(
      "accessibilityState",
      { disabled: false, selected: true },
    );
  });

  it("does not clear a read-only search field", () => {
    const onValueChange = jest.fn();
    render(
      <SearchField
        defaultValue="locked"
        editable={false}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Clear search" })).toBeDisabled();
    fireEvent.press(screen.getByRole("button", { name: "Clear search" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables already-open time options when the picker becomes disabled", () => {
    const labels = {
      close: "Close",
      hour: "Hour",
      minute: "Minute",
      open: "Choose time",
      placeholder: "Time",
    };
    const onChange = jest.fn();
    render(
      <TimePicker
        labels={labels}
        selection={{ mode: "controlled", onChange, value: "12:30" }}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Choose time" }));
    screen.rerender(
      <TimePicker
        disabled
        labels={labels}
        selection={{ mode: "controlled", onChange, value: "12:30" }}
      />,
    );
    const option = screen.getByRole("radio", { name: "13" });
    expect(option).toBeDisabled();
    fireEvent.press(option);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("wraps toolbar string children in native text", () => {
    render(<ToolbarButton>Save changes</ToolbarButton>);
    expect(screen.getByText("Save changes").type).toBe("Text");
  });

  it("includes service details in the grouped status accessibility label", () => {
    render(
      <StatusBoard
        items={[
          {
            description: "Primary region",
            id: "api",
            label: "API",
            meta: "Updated now",
            status: "healthy",
            value: "42 ms",
          },
        ]}
      />,
    );
    expect(
      screen.getByLabelText("API, Healthy, Primary region, 42 ms, Updated now"),
    ).toBeOnTheScreen();
  });
});
