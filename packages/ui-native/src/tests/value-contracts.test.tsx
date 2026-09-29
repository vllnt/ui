import { act, fireEvent, render, screen } from "@testing-library/react-native";
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
import type { ReducedMotionService } from "../primitives/use-reduced-motion";

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

const motionEnabled: ReducedMotionService = {
  addEventListener: () => ({ remove: jest.fn() }),
  isReduceMotionEnabled: () => Promise.resolve(false),
};

const nonFinite = [
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
];

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
  it.each(nonFinite)("ScrollProgress maps %p to empty progress", (value) => {
    render(<ScrollProgress label="Reading" value={value} />);
    const bar = screen.getByLabelText("Reading");
    expect(bar.props.accessibilityValue).toMatchObject({ now: 0 });
    expect(StyleSheet.flatten(bar.findByType(View).props.style)).toMatchObject({
      width: "0%",
    });
  });

  it("calculateScrollProgress maps non-finite offsets to zero", () => {
    expect(
      calculateScrollProgress({
        contentOffset: { y: Number.NaN },
        contentSize: { height: 200 },
        layoutMeasurement: { height: 100 },
      }),
    ).toBe(0);
  });

  it.each(nonFinite)(
    "TextReveal keeps word opacity finite for %p",
    async (progress) => {
      render(
        <TextReveal progress={progress} reducedMotionService={motionEnabled}>
          alpha beta
        </TextReveal>,
      );
      await act(async () => {
        await Promise.resolve();
      });
      for (const word of ["alpha", "beta"]) {
        expect(
          StyleSheet.flatten(
            screen.getByText(word, { includeHiddenElements: true }).props.style,
          ),
        ).toMatchObject({ opacity: 0.2 });
      }
    },
  );

  it.each(nonFinite)(
    "TutorialComplete reports 0%% for %p",
    (completionPercent) => {
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
      expect(screen.getByText("Guide 0%")).toBeTruthy();
      expect(screen.getByText("Finished")).toBeTruthy();
    },
  );

  it.each(nonFinite)(
    "Stepper falls back to the first step for %p",
    (currentStep) => {
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
      expect(
        screen.getByRole("button", { name: "One current" }),
      ).toBeSelected();
      expect(screen.getByRole("button", { name: "Two upcoming" })).toBeTruthy();
    },
  );

  it.each(nonFinite)("AvatarGroup treats max %p as no limit", (max) => {
    render(
      <AvatarGroup
        items={[
          { accessibilityLabel: "Ada", fallback: "A", id: "ada" },
          { accessibilityLabel: "Bo", fallback: "B", id: "bo" },
        ]}
        max={max}
      />,
    );
    expect(screen.getByLabelText("Ada")).toBeTruthy();
    expect(screen.getByLabelText("Bo")).toBeTruthy();
    expect(screen.queryByLabelText(/more/)).toBeNull();
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
});
