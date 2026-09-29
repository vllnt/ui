import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text, View } from "react-native";

import { AvatarGroup } from "../components/avatar-group/avatar-group";
import { Calendar } from "../components/calendar/calendar";
import { RangeCalendar } from "../components/range-calendar/range-calendar";
import {
  calculateScrollProgress,
  ScrollProgress,
} from "../components/scroll-progress/scroll-progress";
import { StatCard } from "../components/stat-card/stat-card";
import { Stepper } from "../components/stepper/stepper";
import { TextReveal } from "../components/text-reveal/text-reveal";
import { TutorialComplete } from "../components/tutorial-complete/tutorial-complete";

import { flushMicrotasks, reducedMotion } from "./test-utils";

function historicDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

const calendarLabels = {
  formatDayAccessibilityLabel: (date: Date) =>
    `Day ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  formatMonth: (date: Date) =>
    `Month ${date.getFullYear()}-${date.getMonth() + 1}`,
  formatWeekday: String,
  nextMonth: "Next month",
  previousMonth: "Previous month",
};

const tutorialLabels = {
  backToTutorials: "Back",
  completionSummary: (title: string, percent: number) => `${title} ${percent}%`,
  relatedContent: "Related",
  restart: "Restart",
  reviewSection: (title: string, done: boolean) =>
    `${title} ${done ? "done" : "not done"}`,
  reviewSections: "Review",
  share: "Share",
  tutorialComplete: "Complete",
  tutorialFinished: "Finished",
};

const motionEnabled = reducedMotion(false);

const NAN = Number.NaN;
const POS_INF = Number.POSITIVE_INFINITY;
const NEG_INF = Number.NEGATIVE_INFINITY;

describe("Calendar historic years", () => {
  it.each([0, 50, 99])("keeps year %i instead of remapping to 19xx", (year) => {
    const onChange = jest.fn();
    const onMonthChange = jest.fn();
    render(
      <Calendar
        labels={calendarLabels}
        month={historicDate(year, 1, 1)}
        onMonthChange={onMonthChange}
        selection={{ mode: "controlled", onChange, value: undefined }}
      />,
    );
    expect(screen.getByText(`Month ${year}-2`)).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: `Day ${year}-2-3` }));
    expect(onChange.mock.calls[0]?.[0].getFullYear()).toBe(year);
    fireEvent.press(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange.mock.calls[0]?.[0].getFullYear()).toBe(year);
  });

  it("uses the proleptic Gregorian leap rule for year 0", () => {
    render(
      <Calendar
        labels={calendarLabels}
        month={historicDate(0, 1, 1)}
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Day 0-2-29" })).toBeTruthy();
  });

  it("selects historic ranges in RangeCalendar", () => {
    const onChange = jest.fn();
    render(
      <RangeCalendar
        labels={calendarLabels}
        month={historicDate(50, 3, 1)}
        range={{ mode: "controlled", onChange, value: undefined }}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Day 50-4-10" }));
    expect(onChange.mock.calls[0]?.[0].start.getFullYear()).toBe(50);
  });
});

describe("non-finite numeric inputs", () => {
  it.each([
    [NAN, 0],
    [POS_INF, 100],
    [NEG_INF, 0],
  ])("ScrollProgress maps %p to %p%%", (value, percent) => {
    render(<ScrollProgress label="Reading" value={value} />);
    const bar = screen.getByLabelText("Reading");
    expect(bar.props.accessibilityValue).toMatchObject({ now: percent });
    expect(StyleSheet.flatten(bar.findByType(View).props.style)).toMatchObject({
      width: `${percent}%`,
    });
  });

  it.each([
    [NAN, 0],
    [POS_INF, 1],
    [NEG_INF, 0],
  ])("calculateScrollProgress maps offset %p to %p", (y, progress) => {
    expect(
      calculateScrollProgress({
        contentOffset: { y },
        contentSize: { height: 200 },
        layoutMeasurement: { height: 100 },
      }),
    ).toBe(progress);
  });

  it.each([
    [NAN, 0.2],
    [POS_INF, 1],
    [NEG_INF, 0.2],
  ])(
    "TextReveal maps progress %p to word opacity %p",
    async (progress, opacity) => {
      render(
        <TextReveal progress={progress} reducedMotionService={motionEnabled}>
          alpha beta
        </TextReveal>,
      );
      await flushMicrotasks();
      for (const word of ["alpha", "beta"]) {
        expect(
          StyleSheet.flatten(
            screen.getByText(word, { includeHiddenElements: true }).props.style,
          ),
        ).toMatchObject({ opacity });
      }
    },
  );

  it.each([
    [NAN, 0, "Finished"],
    [POS_INF, 100, "Complete"],
    [NEG_INF, 0, "Finished"],
  ])(
    "TutorialComplete maps %p to %p%%",
    (completionPercent, percent, heading) => {
      render(
        <TutorialComplete
          completedSectionIds={[]}
          completionPercent={completionPercent}
          labels={tutorialLabels}
          onBack={jest.fn()}
          onGoToSection={jest.fn()}
          onRestart={jest.fn()}
          sections={[{ id: "intro", title: "Intro" }]}
          title="Guide"
        />,
      );
      expect(screen.getByText(`Guide ${percent}%`)).toBeTruthy();
      expect(screen.getByText(heading)).toBeTruthy();
    },
  );

  it.each([
    [NAN, "One current", "Two upcoming"],
    [POS_INF, "One complete", "Two current"],
    [NEG_INF, "One current", "Two upcoming"],
  ])("Stepper maps step %p to %p", (currentStep, first, second) => {
    render(
      <Stepper
        currentStep={currentStep}
        labels={{
          step: (step, state) => `${step.title} ${state}`,
          stepper: "Progress",
        }}
        steps={[
          { id: "one", title: "One" },
          { id: "two", title: "Two" },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: first })).toBeTruthy();
    expect(screen.getByRole("button", { name: second })).toBeTruthy();
  });

  it.each([
    [NAN, ["Ada", "Bo"], 0],
    [POS_INF, ["Ada", "Bo"], 0],
    [NEG_INF, [], 2],
  ])("AvatarGroup max %p shows %p", (max, visible, hidden) => {
    render(
      <AvatarGroup
        items={[
          { accessibilityLabel: "Ada", fallback: "A", id: "ada" },
          { accessibilityLabel: "Bo", fallback: "B", id: "bo" },
        ]}
        max={max}
      />,
    );
    for (const name of ["Ada", "Bo"]) {
      if (visible.includes(name))
        expect(screen.getByLabelText(name)).toBeTruthy();
      else expect(screen.queryByLabelText(name)).toBeNull();
    }
    if (hidden > 0)
      expect(screen.getByLabelText(`${hidden} more`)).toBeTruthy();
    else expect(screen.queryByLabelText(/more/)).toBeNull();
  });
});

describe("StatCard zero content", () => {
  it("renders numeric 0 for change, meta, and description", () => {
    render(
      <StatCard change={0} description={0} label="Errors" meta={0} value="3" />,
    );
    expect(screen.getByText("No change · 0", { exact: false })).toBeTruthy();
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("omits undefined and null details", () => {
    const { toJSON } = render(
      <View>
        <StatCard change={null} label="Errors" meta={undefined} value="3" />
        <Text>end</Text>
      </View>,
    );
    expect(screen.queryByText(/change/)).toBeNull();
    expect(JSON.stringify(toJSON())).not.toContain("·");
  });

  it("omits NaN details", () => {
    const { toJSON } = render(
      <StatCard
        change={Number.NaN}
        description={Number.NaN}
        label="Errors"
        meta={Number.NaN}
        value="3"
      />,
    );
    expect(screen.queryByText(/NaN/)).toBeNull();
    expect(JSON.stringify(toJSON())).not.toContain("NaN");
  });
});
