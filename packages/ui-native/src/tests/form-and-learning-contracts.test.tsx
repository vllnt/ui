import { useState } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { FileUpload } from "../components/atoms/file-upload/file-upload";
import { Flashcard } from "../components/atoms/flashcard/flashcard";
import { DateField } from "../components/molecules/date-field/date-field";
import { InlineInput } from "../components/molecules/inline-input/inline-input";
import { InteractiveTimeline } from "../components/organisms/interactive-timeline/interactive-timeline";
import type { PickedFile } from "../primitives/platform-services";

import { deferred } from "./test-utils";

const file = { name: "Existing", uri: "file:///existing" };
const fileLabels = {
  choose: "Choose files",
  empty: "No files",
  failed: "Choose failed",
  remove: (name: string) => `Remove ${name}`,
  unavailable: "Picker unavailable",
};

const chooseFiles = { name: "Choose files" };
const deferredFiles = () => deferred<readonly PickedFile[]>();

const timelineProps = {
  endDate: new Date(2026, 0, 2),
  events: [
    {
      id: "end",
      startDate: new Date(2026, 0, 2),
      title: "End",
      trackId: "lane",
    },
  ],
  formatDate: () => "date",
  labels: { region: "Timeline", zoomIn: "Zoom in", zoomOut: "Zoom out" },
  startDate: new Date(2026, 0, 1),
  tracks: [{ id: "lane", label: "Lane" }],
};

it("supports date separators and validates years below 100 without Date constructor remapping", () => {
  const onChange = jest.fn();
  render(
    <DateField
      labels={{
        error: "Invalid date",
        input: "Date",
        placeholder: "YYYY-MM-DD",
      }}
      valueState={{ defaultValue: undefined, mode: "uncontrolled", onChange }}
    />,
  );
  expect(screen.getByLabelText("Date").props.inputMode).toBe("text");
  fireEvent(screen.getByLabelText("Date"), "focus");
  fireEvent.changeText(screen.getByLabelText("Date"), "0096-02-29");
  fireEvent(screen.getByLabelText("Date"), "submitEditing");
  expect(onChange).toHaveBeenCalledWith("0096-02-29");
  fireEvent.changeText(screen.getByLabelText("Date"), "0097-02-29");
  fireEvent(screen.getByLabelText("Date"), "submitEditing");
  expect(screen.getByText("Invalid date")).toBeOnTheScreen();
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("does not accumulate rejected controlled file proposals", async () => {
  const onChange = jest.fn();
  const pickFiles = jest
    .fn()
    .mockResolvedValueOnce([{ name: "First", uri: "file:///first" }])
    .mockResolvedValueOnce([{ name: "Second", uri: "file:///second" }]);
  render(
    <FileUpload
      filePicker={{ pickFiles }}
      files={{ mode: "controlled", onChange, value: [file] }}
      labels={fileLabels}
    />,
  );
  await act(async () => {
    fireEvent.press(screen.getByRole("button", chooseFiles));
  });
  await act(async () => {
    fireEvent.press(screen.getByRole("button", chooseFiles));
  });
  expect(onChange).toHaveBeenLastCalledWith([
    file,
    { name: "Second", uri: "file:///second" },
  ]);
});

it("normalizes non-finite timeline zoom to a usable minimum", () => {
  render(<InteractiveTimeline {...timelineProps} zoom={Number.NaN} />);
  expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeEnabled();
});

it("preserves the selected single file when the picker returns no files", async () => {
  const onChange = jest.fn();
  render(
    <FileUpload
      allowMultiple={false}
      filePicker={{ pickFiles: async () => [] }}
      files={{ defaultValue: [file], mode: "uncontrolled", onChange }}
      labels={fileLabels}
    />,
  );
  await act(async () => {
    fireEvent.press(screen.getByRole("button", chooseFiles));
  });
  expect(screen.getByText("Existing")).toBeOnTheScreen();
  expect(onChange).not.toHaveBeenCalled();
});

it("allows only one pending picker and exposes busy state", async () => {
  const pending = deferredFiles();
  const pickFiles = jest.fn(() => pending.promise);
  render(
    <FileUpload
      filePicker={{ pickFiles }}
      files={{ defaultValue: [], mode: "uncontrolled" }}
      labels={fileLabels}
    />,
  );
  fireEvent.press(screen.getByRole("button", chooseFiles));
  expect(
    screen.getByRole("button", chooseFiles).props.accessibilityState,
  ).toEqual({
    busy: true,
    disabled: true,
  });
  fireEvent.press(screen.getByRole("button", chooseFiles));
  expect(pickFiles).toHaveBeenCalledTimes(1);
  await pending.resolveInAct([file]);
  expect(screen.getByText("Existing")).toBeOnTheScreen();
  expect(
    screen.getByRole("button", chooseFiles).props.accessibilityState,
  ).toEqual({
    busy: false,
    disabled: false,
  });
});

it("does not notify file selection after unmount", async () => {
  const pending = deferredFiles();
  const onChange = jest.fn();
  const { unmount } = render(
    <FileUpload
      filePicker={{ pickFiles: () => pending.promise }}
      files={{ defaultValue: [], mode: "uncontrolled", onChange }}
      labels={fileLabels}
    />,
  );
  fireEvent.press(screen.getByRole("button", chooseFiles));
  unmount();
  await pending.resolveInAct([file]);
  expect(onChange).not.toHaveBeenCalled();
});

it("keeps flashcard question and answer individually accessible", () => {
  render(
    <Flashcard
      answer={<Text>Answer content</Text>}
      labels={{
        answer: "Answer",
        answerInstruction: "Review",
        flip: "Flip",
        hint: (hint) => hint,
        prompt: "Prompt",
        promptInstruction: "Think",
        revealAnswer: "Reveal",
        showPrompt: "Show prompt",
        study: "Study",
      }}
      question={<Text>Question content</Text>}
      title="Card"
    />,
  );
  expect(screen.queryByLabelText("Prompt")).toBeNull();
  expect(screen.getByText("Prompt")).toBeOnTheScreen();
  expect(
    screen.getByRole("text", { name: "Question content" }),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("button", { name: "Flip: Reveal" }));
  expect(
    screen.getByRole("text", { name: "Answer content" }),
  ).toBeOnTheScreen();
});

it("commits edits made after a non-blurring submit", () => {
  const onCommit = jest.fn();
  function Editor() {
    const [value, setValue] = useState("Before");
    return (
      <InlineInput
        accessibilityLabel="Editor"
        onChangeText={setValue}
        onCommit={onCommit}
        submitBehavior="submit"
        value={value}
      />
    );
  }
  render(<Editor />);
  fireEvent(screen.getByLabelText("Editor"), "focus");
  fireEvent(screen.getByLabelText("Editor"), "submitEditing");
  fireEvent.changeText(screen.getByLabelText("Editor"), "After");
  fireEvent(screen.getByLabelText("Editor"), "blur");
  expect(onCommit.mock.calls).toEqual([["Before"], ["After"]]);
});

it("forwards timeline layout and keeps end-boundary events inside the lane", () => {
  const onLayout = jest.fn();
  render(
    <InteractiveTimeline
      {...timelineProps}
      onLayout={onLayout}
      testID="timeline"
    />,
  );
  const event = {
    nativeEvent: { layout: { height: 100, width: 320, x: 0, y: 0 } },
  };
  fireEvent(screen.getByTestId("timeline"), "layout", event);
  expect(onLayout).toHaveBeenCalledWith(event);
  expect(screen.getByRole("button", { name: "End, date" })).toHaveStyle({
    left: 276,
    width: 44,
  });
});
