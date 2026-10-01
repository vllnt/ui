import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { lightTheme } from "@vllnt/ui-core";
import { AccessibilityInfo, Text as NativeText } from "react-native";

import { Avatar, AvatarImage } from "../components/atoms/avatar/avatar";
import { Button } from "../components/atoms/button/button";
import { ButtonGroup } from "../components/atoms/button-group/button-group";
import { Calendar } from "../components/atoms/calendar/calendar";
import { Checkbox } from "../components/atoms/checkbox/checkbox";
import { CheckboxGroup } from "../components/atoms/checkbox-group/checkbox-group";
import { Exercise } from "../components/atoms/exercise/exercise";
import { Fieldset } from "../components/atoms/fieldset/fieldset";
import { FileUpload } from "../components/atoms/file-upload/file-upload";
import { Form, FormMessage, FormSubmit } from "../components/atoms/form/form";
import { Input } from "../components/atoms/input/input";
import { InputOTP } from "../components/atoms/input-otp/input-otp";
import { Link } from "../components/atoms/link/link";
import { ModelSelector } from "../components/atoms/model-selector/model-selector";
import { Quiz } from "../components/atoms/quiz/quiz";
import { Rating } from "../components/atoms/rating/rating";
import { Reasoning } from "../components/atoms/reasoning/reasoning";
import { Select } from "../components/atoms/select/select";
import { TagsInput } from "../components/atoms/tags-input/tags-input";
import { Text } from "../components/atoms/text/text";
import { Banner } from "../components/molecules/banner/banner";
import { ContentIntro } from "../components/molecules/content-intro/content-intro";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../components/molecules/field/field";
import { FloatingActionButton } from "../components/molecules/floating-action-button/floating-action-button";
import { MultiSelect } from "../components/molecules/multi-select/multi-select";
import { PhoneInput } from "../components/molecules/phone-input/phone-input";
import { ProgressBar } from "../components/molecules/progress-bar/progress-bar";
import { RangeCalendar } from "../components/molecules/range-calendar/range-calendar";
import { SearchField } from "../components/molecules/search-field/search-field";
import { TextField } from "../components/molecules/text-field/text-field";
import { ProgressCard } from "../components/organisms/progress-card/progress-card";
import { TimePicker } from "../components/organisms/time-picker/time-picker";

import { flushMicrotasks, renderThemed, themed } from "./test-utils";

const hostNode = () => ({ measure: jest.fn() });
let announceSpy: jest.SpyInstance;
let focusSpy: jest.SpyInstance;
beforeEach(() => {
  announceSpy = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  focusSpy = jest.spyOn(AccessibilityInfo, "sendAccessibilityEvent");
  announceSpy.mockClear();
  focusSpy.mockClear();
});
afterEach(() => {
  announceSpy.mockRestore();
  focusSpy.mockRestore();
});

const calendarLabels = {
  formatDayAccessibilityLabel: (date: Date) => `Day ${date.getDate()}`,
  formatMonth: (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`,
  formatWeekday: String,
  nextMonth: "Next month",
  previousMonth: "Previous month",
};

it("names field controls from their visible label and speaks errors", async () => {
  const field = (invalid: boolean) => (
    <Field invalid={invalid}>
      <FieldLabel>Username</FieldLabel>
      <FieldControl testID="control" />
      <FieldDescription>Public identifier</FieldDescription>
      <FieldError>Already used</FieldError>
    </Field>
  );
  const view = renderThemed(field(false));
  const control = screen.getByTestId("control");
  expect(control).toHaveProp("accessibilityLabel", "Username");
  expect(control).toHaveProp("accessibilityHint", "Public identifier");
  expect(announceSpy).not.toHaveBeenCalled();
  view.rerender(themed(field(true)));
  expect(screen.getByTestId("control")).toHaveProp(
    "accessibilityHint",
    "Already used. Public identifier",
  );
  expect(screen.getByTestId("control")).not.toHaveProp("aria-invalid");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledWith("Already used");
});

it("announces text-field, form, and one-time-code errors once per update", async () => {
  const view = renderThemed(
    <>
      <TextField label="Email" value="" />
      <InputOTP length={6} valueState={{ mode: "controlled", value: "12" }} />
    </>,
  );
  expect(screen.getByLabelText("One-time code")).toHaveProp(
    "accessibilityHint",
    "2/6",
  );
  expect(screen.getByLabelText("One-time code")).not.toHaveProp(
    "accessibilityValue",
  );
  view.rerender(
    themed(
      <>
        <TextField error="Required" label="Email" value="" />
        <InputOTP
          errorText="Wrong code"
          invalid
          length={6}
          valueState={{ mode: "controlled", value: "12" }}
        />
        <Form label="Profile" onSubmit={jest.fn()}>
          <FormMessage>Fix the highlighted fields</FormMessage>
          <FormSubmit>Save</FormSubmit>
        </Form>
      </>,
    ),
  );
  expect(screen.getByLabelText("Email")).toHaveProp(
    "accessibilityHint",
    "Required",
  );
  expect(screen.getByLabelText("One-time code")).toHaveProp(
    "accessibilityHint",
    "Wrong code. 2/6",
  );
  expect(screen.getByRole("button", { name: "Save" })).toHaveProp(
    "accessibilityHint",
    "Profile",
  );
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledTimes(1);
  const [spoken] = announceSpy.mock.lastCall ?? [];
  for (const message of [
    "Required",
    "Wrong code",
    "Fix the highlighted fields",
  ])
    expect(spoken).toContain(message);
});

it("speaks the current value of picker triggers and titles their sheets", async () => {
  renderThemed(
    <>
      <Select
        labels={{
          close: "Close",
          open: "Fruit",
          options: "Fruits",
          placeholder: "Pick",
        }}
        options={[{ id: "a", label: "Apple" }]}
        selection={{ defaultValue: "a", mode: "uncontrolled" }}
      />
      <MultiSelect
        labels={{
          close: "Done",
          empty: "No match",
          open: "Tags",
          options: "Tag options",
          placeholder: "None",
          results: (count) => `${count} tags`,
          search: "Search tags",
        }}
        options={[
          { id: "x", label: "Native" },
          { id: "y", label: "Web" },
        ]}
        searchable
        selection={{ defaultValue: new Set(["x"]), mode: "uncontrolled" }}
      />
      <TimePicker
        labels={{
          close: "Close time",
          hour: "Hour",
          minute: "Minute",
          open: "Start time",
          placeholder: "No time",
        }}
        selection={{ defaultValue: "07:30", mode: "uncontrolled" }}
      />
      <PhoneInput
        accessibilityLabel="Phone"
        country={{ code: "FR", dialCode: "+33", label: "France" }}
        onPressCountry={jest.fn()}
      />
    </>,
  );
  for (const [name, text] of [
    ["Fruit", "Apple"],
    ["Tags", "Native"],
    ["Start time", "07:30"],
    ["Choose country dialing code", "France, +33"],
  ])
    expect(screen.getByRole("button", { name })).toHaveProp(
      "accessibilityValue",
      { text },
    );
  fireEvent.press(screen.getByRole("button", { name: "Fruit" }));
  expect(screen.getByRole("header", { name: "Fruits" })).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("button", { name: "Tags" }));
  fireEvent.changeText(screen.getByLabelText("Search tags"), "we");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("1 tags");
  fireEvent.changeText(screen.getByLabelText("Search tags"), "zz");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("No match");
  fireEvent.press(screen.getByRole("button", { name: "Start time" }));
  expect(screen.getByRole("radio", { name: "Hour, 07" })).toHaveProp(
    "accessibilityState",
    { checked: true, disabled: false },
  );
});

it("names checkboxes, hides decoration, and skips unnamed avatar images", () => {
  renderThemed(
    <>
      <Checkbox label="Accept terms" />
      <Avatar>
        <AvatarImage source={{ uri: "decorative" }} testID="avatar-image" />
      </Avatar>
    </>,
  );
  const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
  expect(checkbox).toHaveProp("accessibilityState", {
    checked: false,
    disabled: false,
  });
  const image = screen.getByTestId("avatar-image", {
    includeHiddenElements: true,
  });
  expect(image).toHaveProp("accessible", false);
  expect(image).toHaveProp("importantForAccessibility", "no-hide-descendants");
  expect(image).toHaveProp("accessibilityElementsHidden", true);
});

it("returns screen-reader focus after clearing search or removing items", async () => {
  const onRemoveFile = jest.fn();
  render(
    themed(
      <>
        <SearchField accessibilityLabel="Filter" defaultValue="Ada" />
        <TagsInput
          labels={{
            add: "Add",
            input: "Tags",
            remove: (tag) => `Remove ${tag}`,
          }}
          tags={{ defaultValue: ["native"], mode: "uncontrolled" }}
        />
        <FileUpload
          filePicker={{ pickFiles: async () => [] }}
          files={{
            defaultValue: [{ name: "a.txt", uri: "file:///a.txt" }],
            mode: "uncontrolled",
            onChange: onRemoveFile,
          }}
          labels={{
            choose: "Choose files",
            empty: "No files",
            failed: "Failed",
            remove: (name) => `Remove ${name}`,
            unavailable: "Unavailable",
          }}
        />
      </>,
    ),
    { createNodeMock: hostNode },
  );
  fireEvent.press(screen.getByRole("button", { name: "Clear search" }));
  fireEvent.press(screen.getByRole("button", { name: "Remove native" }));
  fireEvent.press(screen.getByRole("button", { name: "Remove a.txt" }));
  expect(focusSpy).toHaveBeenCalledTimes(3);
  expect(onRemoveFile).toHaveBeenCalledWith([]);
});

it("announces picked files and exposes rating and checkbox group names", async () => {
  renderThemed(
    <>
      <FileUpload
        filePicker={{
          pickFiles: async () => [{ name: "b.txt", uri: "file:///b.txt" }],
        }}
        files={{ defaultValue: [], mode: "uncontrolled" }}
        labels={{
          added: (names) => `Added ${names.join(", ")}`,
          choose: "Choose files",
          empty: "No files",
          failed: "Failed",
          remove: (name) => `Remove ${name}`,
          unavailable: "Unavailable",
        }}
      />
      <Rating
        label="Lesson rating"
        labels={{
          option: (value) => `${value} stars`,
          value: (value, max) => `${value} of ${max}`,
        }}
        showValue
      />
      <CheckboxGroup
        items={[{ id: "email", label: "Email" }]}
        label="Channels"
        selection={{ defaultValue: new Set<string>(), mode: "uncontrolled" }}
      />
    </>,
  );
  await act(async () => {
    fireEvent.press(screen.getByRole("button", { name: "Choose files" }));
  });
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledWith("Added b.txt");
  expect(screen.getByRole("radio", { name: "3 stars" })).toHaveProp(
    "accessibilityHint",
    "Lesson rating",
  );
  fireEvent.press(screen.getByRole("radio", { name: "3 stars" }));
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledWith("3 of 5");
  expect(screen.getByRole("checkbox", { name: "Email" })).toHaveProp(
    "accessibilityHint",
    "Channels",
  );
});

it("announces calendar months and names range endpoints", async () => {
  renderThemed(
    <>
      <Calendar
        labels={calendarLabels}
        selection={{
          defaultValue: new Date(2025, 0, 15),
          mode: "uncontrolled",
        }}
      />
      <RangeCalendar
        labels={{
          ...calendarLabels,
          formatDayAccessibilityLabel: (date) => `Range day ${date.getDate()}`,
          rangeEnd: "Last",
          rangeStart: "First",
        }}
        month={new Date(2025, 5, 1)}
        range={{
          mode: "controlled",
          value: { end: new Date(2025, 5, 12), start: new Date(2025, 5, 10) },
        }}
      />
    </>,
  );
  fireEvent.press(screen.getAllByRole("button", { name: "Next month" })[0]);
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledWith("2025-2");
  expect(screen.getByRole("button", { name: "Range day 10" })).toHaveProp(
    "accessibilityValue",
    { text: "First" },
  );
  expect(screen.getByRole("button", { name: "Range day 12" })).toHaveProp(
    "accessibilityValue",
    { text: "Last" },
  );
  expect(screen.getByRole("button", { name: "Range day 11" })).toHaveProp(
    "accessibilityState",
    { disabled: false, selected: true },
  );
});

it("exposes learning state without colour or selected-only cues", () => {
  render(
    themed(
      <>
        <Exercise
          hint="Use a map"
          labels={{
            difficulty: { easy: "Easy", hard: "Hard", medium: "Medium" },
            hideSolution: "Hide solution",
            hint: "Hint",
            markComplete: "Mark complete",
            markIncomplete: "Mark incomplete",
            showHint: "Show hint",
            showSolution: "Show solution",
            solution: "Solution",
          }}
          solution={<NativeText>Answer</NativeText>}
          title="Loops"
        >
          <NativeText>Task</NativeText>
        </Exercise>
        <Quiz
          defaultSelectedId="b"
          defaultSubmitted
          labels={{
            checkAnswer: "Check",
            correct: "Correct",
            hint: "Hint",
            incorrect: "Incorrect",
            option: (option) => option.label,
            options: "Answers",
            tryAgain: "Try again",
          }}
          options={[
            { correct: true, id: "a", label: "Four" },
            { explanation: "Off by one", id: "b", label: "Five" },
          ]}
          question="2 + 2?"
        />
        <ContentIntro
          completedSections={new Set(["one"])}
          estimatedTime="5 min"
          onGoToSection={jest.fn()}
          onStart={jest.fn()}
          renderIntroContent={() => null}
          sections={[{ id: "one", title: "Setup" }]}
          title="Intro"
        />
      </>,
    ),
    { createNodeMock: hostNode },
  );
  expect(screen.getByRole("button", { name: "Show solution" })).toHaveProp(
    "accessibilityState",
    { expanded: false },
  );
  fireEvent.press(screen.getByRole("button", { name: "Show hint" }));
  expect(screen.getByLabelText("Hint: Use a map")).toBeOnTheScreen();
  expect(focusSpy).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("radio", { name: "Four" })).toHaveProp(
    "accessibilityValue",
    { text: "Correct" },
  );
  const wrong = screen.getByRole("radio", { name: "Five" });
  expect(wrong).toHaveProp("accessibilityValue", { text: "Incorrect" });
  expect(wrong).toHaveProp("accessibilityHint", "Off by one");
  expect(screen.getByRole("button", { name: "Setup" })).toHaveProp(
    "accessibilityValue",
    { text: "completed" },
  );
  expect(screen.getByRole("button", { name: "Setup" })).toHaveProp(
    "accessibilityState",
    { busy: false },
  );
});

it("keeps visible status and progress in composed names", async () => {
  const reasoningLabels = {
    collapse: "Hide reasoning",
    expand: "Show reasoning",
    reasoned: "Reasoned",
    reasoning: "Reasoning",
  };
  const view = renderThemed(
    <>
      <Reasoning isStreaming labels={reasoningLabels} />
      <ProgressCard
        badgeLabel="New"
        description="Learn hooks"
        max={4}
        metadata={[{ id: "time", label: "10 min" }]}
        onPress={jest.fn()}
        title="Hooks"
        value={1}
      />
      <ProgressBar
        isLoading
        labels={{ loading: (status) => `Chargement ${status}` }}
        max={4}
        value={1}
      />
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Hide reasoning" });
  expect(trigger).toHaveProp("accessibilityValue", { text: "Reasoning" });
  expect(trigger).toBeBusy();
  const card = screen.getByRole("button", { name: "Hooks" });
  expect(card).toHaveProp("accessibilityValue", { text: "1 / 4 completed" });
  expect(card).toHaveProp("accessibilityHint", "New. Learn hooks. 10 min");
  expect(screen.getByRole("progressbar", { name: "Progress" })).toHaveProp(
    "accessibilityValue",
    { text: "Chargement Progress" },
  );
  view.rerender(themed(<Reasoning duration="3s" labels={reasoningLabels} />));
  expect(screen.getByRole("button", { name: "Show reasoning" })).toHaveProp(
    "accessibilityValue",
    { text: "Reasoned, 3s" },
  );
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledWith("Reasoned");
});

it("describes model rows and announces filtered counts", async () => {
  renderThemed(
    <ModelSelector
      defaultOpen
      formatPricing={() => "$1"}
      labels={{
        close: "Close",
        description: "Choose a model",
        noModels: "No models",
        results: (count) => `${count} models`,
        search: "Search models",
        selected: "Selected",
        title: "Models",
        unavailable: "Unavailable",
      }}
      models={[
        { description: "Fast", id: "fast", name: "Fast model" },
        {
          id: "down",
          name: "Down model",
          serviceState: { message: "Maintenance", status: "unavailable" },
        },
      ]}
    />,
  );
  expect(screen.getByRole("radio", { name: "Fast model" })).toHaveProp(
    "accessibilityHint",
    "Fast. $1",
  );
  expect(screen.getByRole("radio", { name: "Down model" })).toHaveProp(
    "accessibilityValue",
    { text: "Unavailable: Maintenance" },
  );
  fireEvent.changeText(screen.getByLabelText("Search models"), "fast");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("1 models");
});

it("gives package text inside filled surfaces the paired foreground", () => {
  renderThemed(
    <>
      <Banner variant="destructive">
        <Text>Outage</Text>
      </Banner>
      <Banner variant="destructive">Degraded</Banner>
      <FloatingActionButton accessibilityLabel="Create" onPress={jest.fn()}>
        <Text>New</Text>
      </FloatingActionButton>
      <Text>Plain</Text>
    </>,
  );
  for (const text of ["Outage", "Degraded"])
    expect(screen.getByText(text)).toHaveStyle({
      color: lightTheme.colors.destructiveForeground,
    });
  expect(screen.getByText("New", { includeHiddenElements: true })).toHaveStyle({
    color: lightTheme.colors.primaryForeground,
  });
  expect(screen.getByText("Plain")).toHaveStyle({
    color: lightTheme.colors.foreground,
  });
});

it("hands group names and disabled state to the controls inside", () => {
  const onPress = jest.fn();
  renderThemed(
    <>
      <Fieldset accessibilityLabel="Shipping" disabled>
        <ButtonGroup label="Address actions">
          <Button onPress={onPress}>Use saved</Button>
        </ButtonGroup>
        <Input accessibilityLabel="Street" />
      </Fieldset>
      <Button accessibilityLabel="Close" size="icon">
        ×
      </Button>
      <Link href="https://example.com" linking={{ openUrl: jest.fn() }}>
        Go
      </Link>
    </>,
  );
  const saved = screen.getByRole("button", { name: "Use saved" });
  expect(saved).toHaveProp("accessibilityHint", "Address actions");
  expect(saved).toBeDisabled();
  fireEvent.press(saved);
  expect(onPress).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Street")).toHaveProp(
    "accessibilityHint",
    "Shipping",
  );
  expect(screen.getByLabelText("Street")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Close" })).toHaveStyle({
    height: 88,
    width: 88,
  });
  expect(screen.getByRole("link", { name: "Go" })).toHaveStyle({
    minHeight: 44,
    minWidth: 44,
  });
});
