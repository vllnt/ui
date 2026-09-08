import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Animated, StyleSheet, Text, View } from "react-native";

import { Meter } from "../components/meter/meter";
import { MultiSelect } from "../components/multi-select/multi-select";
import { NumberInput } from "../components/number-input/number-input";
import { NumberTicker } from "../components/number-ticker/number-ticker";
import { ProgressBar } from "../components/progress-bar/progress-bar";
import { PromptInput } from "../components/prompt-input/prompt-input";
import { Quiz } from "../components/quiz/quiz";
import { RangeCalendar } from "../components/range-calendar/range-calendar";
import { Rating } from "../components/rating/rating";
import { Reasoning } from "../components/reasoning/reasoning";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/resizable/resizable";
import { RevealText } from "../components/reveal-text/reveal-text";
import type { ReducedMotionService } from "../primitives/use-reduced-motion";

const reducedMotionService: ReducedMotionService = {
  addEventListener: () => ({ remove: jest.fn() }),
  isReduceMotionEnabled: () => new Promise(() => void 0),
};
const ratingLabels = {
  option: (value: number) => `Rate ${value}`,
  value: (value: number, max: number) => `${value} of ${max}`,
};
const calendarLabels = {
  formatDayAccessibilityLabel: (date: Date) => `Day ${date.getDate()}`,
  formatMonth: () => "April 2026",
  formatWeekday: String,
  nextMonth: "Next month",
  previousMonth: "Previous month",
};
const multiLabels = {
  close: "Close",
  empty: "No options",
  open: "Choose options",
  options: "Options",
  placeholder: "Choose",
  search: "Search",
};

describe("M–R follow-up regressions", () => {
  it("preserves transitional numeric drafts and commits on blur", () => {
    const onValueChange = jest.fn();
    render(
      <NumberInput
        accessibilityLabel="Amount"
        onValueChange={onValueChange}
        testID="amount"
      />,
    );
    for (const text of ["-", "-1", "-1.", "-1.5"]) {
      fireEvent.changeText(screen.getByTestId("amount"), text);
      expect(screen.getByDisplayValue(text)).toBeTruthy();
    }
    expect(onValueChange).toHaveBeenLastCalledWith(-1.5);
    fireEvent.changeText(screen.getByTestId("amount"), "-");
    fireEvent(screen.getByTestId("amount"), "blur", { nativeEvent: {} });
    expect(screen.getByDisplayValue("-1.5")).toBeTruthy();
  });

  it("preserves controlled decimal drafts and respects external changes and step actions", () => {
    const onValueChange = jest.fn();
    const { rerender } = render(
      <NumberInput onValueChange={onValueChange} testID="amount" value={1} />,
    );
    fireEvent.changeText(screen.getByTestId("amount"), "1.");
    expect(screen.getByDisplayValue("1.")).toBeTruthy();
    rerender(
      <NumberInput onValueChange={onValueChange} testID="amount" value={2} />,
    );
    expect(screen.getByDisplayValue("2")).toBeTruthy();
    fireEvent.changeText(screen.getByTestId("amount"), "2.");
    fireEvent.press(screen.getByRole("button", { name: "Increment" }));
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByDisplayValue("2")).toBeTruthy();
  });

  it.each(["minSize", "maxSize", "defaultSize"])(
    "keeps NaN %s out of panel layout and resize callbacks",
    (property) => {
      const onSizesChange = jest.fn();
      render(
        <ResizablePanelGroup onSizesChange={onSizesChange}>
          <ResizablePanel {...{ [property]: Number.NaN }} testID="panel" />
          <ResizableHandle />
          <ResizablePanel />
        </ResizablePanelGroup>,
      );
      expect(screen.getByTestId("panel")).toHaveStyle({ flexGrow: 50 });
      fireEvent(screen.getByRole("adjustable"), "accessibilityAction", {
        nativeEvent: { actionName: "increment" },
      });
      expect(onSizesChange).toHaveBeenLastCalledWith([55, 45]);
    },
  );

  it.each([
    { max: Number.MAX_VALUE, min: -Number.MAX_VALUE, value: 0, width: "50%" },
    {
      max: Number.MAX_VALUE,
      min: Number.MAX_VALUE,
      value: Number.MAX_VALUE,
      width: "0%",
    },
  ])(
    "keeps extreme finite meter arithmetic valid ($min, $max)",
    ({ max, min, value, width }) => {
      render(<Meter label="Measurement" max={max} min={min} value={value} />);
      expect(
        StyleSheet.flatten(
          screen.getByRole("progressbar").findByType(View).props.style,
        ),
      ).toMatchObject({ width });
    },
  );

  it("reclamps measured prompt height on row limit changes", () => {
    const { rerender } = render(
      <PromptInput inputLabel="Prompt" submitLabel="Send" />,
    );
    fireEvent(screen.getByLabelText("Prompt"), "contentSizeChange", {
      nativeEvent: { contentSize: { height: 100 } },
    });
    rerender(
      <PromptInput inputLabel="Prompt" maxRows={1} submitLabel="Send" />,
    );
    const field = screen.getByLabelText("Prompt");
    expect(field).toHaveProp("scrollEnabled", true);
    expect(field).not.toHaveStyle({ height: 100 });
    rerender(
      <PromptInput inputLabel="Prompt" maxRows={8} submitLabel="Send" />,
    );
    expect(screen.getByLabelText("Prompt")).toHaveStyle({ height: 100 });
  });

  it("normalizes invalid prompt row limits", () => {
    render(
      <PromptInput
        inputLabel="Prompt"
        maxRows={Infinity}
        minRows={Number.NaN}
        submitLabel="Send"
      />,
    );
    expect(screen.getByLabelText("Prompt")).toHaveStyle({ height: 21 });
  });

  it("sanitizes ticker inputs with motion enabled", async () => {
    const timing = jest.spyOn(Animated, "timing");
    const delay = jest.spyOn(Animated, "delay");
    const service: ReducedMotionService = {
      ...reducedMotionService,
      isReduceMotionEnabled: () => Promise.resolve(false),
    };
    try {
      render(
        <NumberTicker
          delay={Infinity}
          duration={1}
          from={Number.NaN}
          reducedMotionService={service}
          value={5}
        />,
      );
      await act(async () => {
        await Promise.resolve();
      });
      expect(delay).toHaveBeenLastCalledWith(0);
      expect(timing).toHaveBeenLastCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({ duration: 1000, toValue: 5 }),
      );
      timing.mockClear();
      screen.rerender(
        <NumberTicker
          duration={Infinity}
          reducedMotionService={service}
          value={6}
        />,
      );
      expect(timing).not.toHaveBeenCalled();
      expect(screen.getByText("6")).toBeTruthy();
    } finally {
      timing.mockRestore();
      delay.mockRestore();
    }
  });

  it("does not schedule nonfinite ticker timing or display nonfinite numbers", () => {
    const timing = jest.spyOn(Animated, "timing");
    render(
      <NumberTicker
        delay={Infinity}
        duration={Number.NaN}
        from={Number.NaN}
        reducedMotionService={reducedMotionService}
        value={Infinity}
      />,
    );
    expect(screen.getByText("0")).toBeTruthy();
    expect(timing).not.toHaveBeenCalled();
    timing.mockRestore();
  });
});

describe("M–R individual Native review regressions", () => {
  it("wraps scalar reasoning duration and quiz explanation in native text", () => {
    render(
      <>
        <Reasoning
          duration="2 seconds"
          labels={{
            collapse: "Collapse",
            expand: "Expand",
            reasoned: "Reasoned",
            reasoning: "Reasoning",
          }}
        />
        <Quiz
          defaultSelectedId="one"
          defaultSubmitted
          explanation="Explanation"
          labels={{
            checkAnswer: "Check",
            correct: "Correct",
            hint: "Hint",
            incorrect: "Incorrect",
            option: (option) => option.label,
            options: "Options",
            tryAgain: "Retry",
          }}
          options={[{ correct: true, id: "one", label: "One" }]}
          question="Question"
        />
      </>,
    );
    expect(screen.getByText("2 seconds")).toBeTruthy();
    expect(screen.getByText("Explanation")).toBeTruthy();
  });

  it("preserves NumberInput caller input styling", () => {
    render(<NumberInput accessibilityLabel="Count" style={{ fontSize: 24 }} />);
    expect(screen.getByDisplayValue("")).toHaveStyle({ fontSize: 24 });
  });

  it.each([
    [Number.NaN, 10],
    [Number.POSITIVE_INFINITY, 10],
    [100, Number.NaN],
    [100, Number.POSITIVE_INFINITY],
  ])(
    "keeps ProgressBar values finite for max %s and value %s",
    (max, value) => {
      render(<ProgressBar max={max} value={value} />);
      expect(screen.getByRole("progressbar")).toHaveAccessibilityValue({
        max: Number.isFinite(max) ? max : 0,
        min: 0,
        now: 0,
        text: "0%",
      });
    },
  );

  it("renormalizes uncontrolled Rating when its maximum shrinks", () => {
    const { rerender } = render(
      <Rating defaultValue={5} label="Score" labels={ratingLabels} showValue />,
    );
    rerender(
      <Rating
        defaultValue={5}
        label="Score"
        labels={ratingLabels}
        max={3}
        showValue
      />,
    );
    expect(screen.getByRole("radio", { name: "Rate 3" })).toBeChecked();
    expect(screen.getByText("3 of 3")).toBeTruthy();
  });

  it("selects range endpoints by local date rather than time of day", () => {
    render(
      <RangeCalendar
        labels={calendarLabels}
        month={new Date(2026, 3, 1)}
        range={{
          mode: "controlled",
          value: {
            end: new Date(2026, 3, 12, 18),
            start: new Date(2026, 3, 10, 15),
          },
        }}
      />,
    );
    for (const day of [10, 11, 12]) {
      expect(screen.getByRole("button", { name: `Day ${day}` })).toBeSelected();
    }
    expect(screen.getByRole("button", { name: "Day 9" })).not.toBeSelected();
  });

  it("orders reversed range dates and ignores invalid range starts", () => {
    const { rerender } = render(
      <RangeCalendar
        labels={calendarLabels}
        month={new Date(2026, 3, 1)}
        range={{
          mode: "controlled",
          value: {
            end: new Date(2026, 3, 10, 15),
            start: new Date(2026, 3, 12, 18),
          },
        }}
      />,
    );
    expect(screen.getByRole("button", { name: "Day 10" })).toBeSelected();
    rerender(
      <RangeCalendar
        labels={calendarLabels}
        month={new Date(2026, 3, 1)}
        range={{ mode: "controlled", value: { start: new Date(Number.NaN) } }}
      />,
    );
    expect(screen.getByRole("button", { name: "Day 10" })).not.toBeSelected();
  });

  it("blocks invisible RevealText hit testing and restores caller pointer behavior", () => {
    const { rerender } = render(
      <RevealText
        reducedMotionService={reducedMotionService}
        testID="reveal"
        visible={false}
      >
        <Text>Content</Text>
      </RevealText>,
    );
    expect(
      screen.getByTestId("reveal", { includeHiddenElements: true }),
    ).toHaveProp("pointerEvents", "none");
    rerender(
      <RevealText
        pointerEvents="box-none"
        reducedMotionService={reducedMotionService}
        testID="reveal"
        visible
      >
        <Text>Content</Text>
      </RevealText>,
    );
    expect(screen.getByTestId("reveal")).toHaveProp(
      "pointerEvents",
      "box-none",
    );
  });

  it("disables already-open MultiSelect options when the root becomes disabled", () => {
    const onChange = jest.fn();
    const options = [{ id: "one", label: "One" }];
    const selection = {
      defaultValue: new Set<string>(),
      mode: "uncontrolled",
      onChange,
    } satisfies Parameters<typeof MultiSelect>[0]["selection"];
    const { rerender } = render(
      <MultiSelect
        labels={multiLabels}
        options={options}
        selection={selection}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Choose options" }));
    rerender(
      <MultiSelect
        disabled
        labels={multiLabels}
        options={options}
        selection={selection}
      />,
    );
    const option = screen.getByRole("checkbox", { name: "One" });
    expect(option).toBeDisabled();
    fireEvent.press(option);
    expect(onChange).not.toHaveBeenCalled();
  });
});
