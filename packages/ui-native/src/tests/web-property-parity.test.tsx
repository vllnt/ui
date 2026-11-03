import { fireEvent, screen } from "@testing-library/react-native";
import { Text as NativeText } from "react-native";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/atoms/collapsible/collapsible";
import { Flashcard } from "../components/atoms/flashcard/flashcard";
import { InputOTP } from "../components/atoms/input-otp/input-otp";
import { Rating } from "../components/atoms/rating/rating";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/atoms/resizable/resizable";
import { SegmentedControl } from "../components/atoms/segmented-control/segmented-control";
import { Toggle } from "../components/atoms/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../components/atoms/toggle-group/toggle-group";
import { DateField } from "../components/molecules/date-field/date-field";
import { Textarea } from "../components/molecules/textarea/textarea";
import { TimeField } from "../components/organisms/time-field/time-field";
import { TreeView } from "../components/organisms/tree-view/tree-view";

import { reducedMotion, renderThemed, themed } from "./test-utils";

const rated = { option: () => "Star", value: (value: number) => `${value}` };
const sizes = {
  default: { minHeight: 44, paddingHorizontal: 12 },
  lg: { minHeight: 48, paddingHorizontal: 16 },
  sm: { minHeight: 44, paddingHorizontal: 8 },
} as const;

it.each(["default", "lg", "sm"] as const)("sizes a toggle: %s", (size) => {
  renderThemed(
    <Toggle size={size} testID="toggle">
      Bold
    </Toggle>,
  );
  expect(screen.getByTestId("toggle")).toHaveStyle(sizes[size]);
});

it("keeps the default toggle size when none is passed", () => {
  renderThemed(<Toggle testID="toggle">Bold</Toggle>);
  expect(screen.getByTestId("toggle")).toHaveStyle(sizes.default);
});

it("sizes and varies toggle group items from the group and per item", () => {
  renderThemed(
    <ToggleGroup size="lg" type="single" variant="outline">
      <ToggleGroupItem testID="inherits" value="a">
        A
      </ToggleGroupItem>
      <ToggleGroupItem size="sm" testID="overrides" value="b" variant="default">
        B
      </ToggleGroupItem>
    </ToggleGroup>,
  );
  expect(screen.getByTestId("inherits")).toHaveStyle({
    ...sizes.lg,
    borderWidth: 1,
  });
  expect(screen.getByTestId("overrides")).toHaveStyle({
    ...sizes.sm,
    borderWidth: 0,
  });
});

it("renders an unstyled default toggle group item without size or variant", () => {
  renderThemed(
    <ToggleGroup type="multiple">
      <ToggleGroupItem testID="plain" value="a">
        A
      </ToggleGroupItem>
    </ToggleGroup>,
  );
  expect(screen.getByTestId("plain")).toHaveStyle({
    ...sizes.default,
    borderWidth: 0,
  });
});

it.each(["default", "lg", "sm"] as const)(
  "sizes segmented control options: %s",
  (size) => {
    renderThemed(
      <SegmentedControl
        items={[{ id: "one", label: "One" }]}
        label="Mode"
        selection={{ defaultValue: "one", mode: "uncontrolled" }}
        size={size}
      />,
    );
    expect(screen.getByRole("radio")).toHaveStyle(sizes[size]);
  },
);

it.each([
  ["sm", 16],
  ["md", 20],
  ["lg", 24],
  [undefined, 24],
] as const)("sizes rating glyphs: %s", (size, fontSize) => {
  renderThemed(<Rating label="Score" labels={rated} max={1} size={size} />);
  expect(screen.getByText("☆")).toHaveStyle({ fontSize });
});

it("accepts disabled on a textarea and the ISO fields", () => {
  const labels = { error: "Invalid", input: "Field", placeholder: "..." };
  renderThemed(
    <>
      <Textarea accessibilityLabel="Notes" disabled />
      <DateField
        accessibilityLabel="Date"
        disabled
        labels={labels}
        valueState={{ defaultValue: undefined, mode: "uncontrolled" }}
      />
      <TimeField
        accessibilityLabel="Time"
        disabled
        labels={labels}
        valueState={{ defaultValue: undefined, mode: "uncontrolled" }}
      />
    </>,
  );
  for (const input of screen.getAllByLabelText(/Notes|Field/)) {
    expect(input).toBeDisabled();
  }
  expect(screen.getByLabelText("Notes").props.editable).toBe(false);
});

it("locks an OTP input when disabled and reports completion once", () => {
  const onComplete = jest.fn();
  const { rerender } = renderThemed(
    <InputOTP
      accessibilityLabel="Code"
      disabled
      length={4}
      onComplete={onComplete}
      valueState={{ defaultValue: "", mode: "uncontrolled" }}
    />,
  );
  expect(screen.getByLabelText("Code").props.editable).toBe(false);
  rerender(
    themed(
      <InputOTP
        accessibilityLabel="Code"
        length={4}
        onComplete={onComplete}
        valueState={{ defaultValue: "", mode: "uncontrolled" }}
      />,
    ),
  );
  fireEvent.changeText(screen.getByLabelText("Code"), "123");
  expect(onComplete).not.toHaveBeenCalled();
  fireEvent.changeText(screen.getByLabelText("Code"), "1234");
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith("1234");
});

it("disables the trigger of a disabled collapsible", () => {
  renderThemed(
    <Collapsible
      disabled
      id="details"
      reducedMotionService={reducedMotion("pending")}
    >
      <CollapsibleTrigger label="Details">
        <NativeText>Toggle</NativeText>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <NativeText>Body</NativeText>
      </CollapsibleContent>
    </Collapsible>,
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  expect(trigger).toBeDisabled();
  fireEvent.press(trigger);
  expect(screen.queryByText("Body")).toBeNull();
});

it("lays out panels by orientation, with direction taking precedence", () => {
  const panels = (
    <>
      <ResizablePanel defaultSize={50} />
      <ResizablePanel defaultSize={50} />
    </>
  );
  const { rerender } = renderThemed(
    <ResizablePanelGroup orientation="vertical" testID="group">
      {panels}
    </ResizablePanelGroup>,
  );
  expect(screen.getByTestId("group")).toHaveStyle({ flexDirection: "column" });
  rerender(
    themed(
      <ResizablePanelGroup orientation="horizontal" testID="group">
        {panels}
      </ResizablePanelGroup>,
    ),
  );
  expect(screen.getByTestId("group")).toHaveStyle({ flexDirection: "row" });
  rerender(
    themed(
      <ResizablePanelGroup
        direction="vertical"
        orientation="horizontal"
        testID="group"
      >
        {panels}
      </ResizablePanelGroup>,
    ),
  );
  expect(screen.getByTestId("group")).toHaveStyle({ flexDirection: "column" });
});

const flashcardLabels = {
  answer: "Answer",
  answerInstruction: "Check",
  flip: "Flip",
  hint: (hint: string) => hint,
  prompt: "Prompt",
  promptInstruction: "Recall",
  revealAnswer: "Reveal answer",
  showPrompt: "Show prompt",
  study: "Study",
};

it("reports flips through the web callback name", () => {
  const onFlipChange = jest.fn();
  const onFlippedChange = jest.fn();
  const { rerender } = renderThemed(
    <Flashcard
      answer="A"
      labels={flashcardLabels}
      onFlipChange={onFlipChange}
      question="Q"
      title="Card"
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "Reveal answer" }));
  expect(onFlipChange).toHaveBeenCalledTimes(1);
  expect(onFlipChange).toHaveBeenCalledWith(true);
  rerender(
    themed(
      <Flashcard
        answer="A"
        labels={flashcardLabels}
        onFlipChange={onFlipChange}
        onFlippedChange={onFlippedChange}
        question="Q"
        title="Card"
      />,
    ),
  );
  fireEvent.press(screen.getByRole("button", { name: "Show prompt" }));
  expect(onFlippedChange).toHaveBeenCalledTimes(1);
  expect(onFlippedChange).toHaveBeenCalledWith(false);
  expect(onFlipChange).toHaveBeenCalledTimes(1);
});

it("drives a tree through the web prop names", () => {
  const onExpandedChange = jest.fn();
  const onSelect = jest.fn();
  renderThemed(
    <TreeView
      defaultExpanded={["src"]}
      defaultSelected={["button"]}
      labels={{
        collapseNode: (node) => `Collapse ${node.label}`,
        expandNode: (node) => `Expand ${node.label}`,
        region: "Files",
      }}
      nodes={[
        {
          id: "src",
          label: "Source",
          nodes: [{ id: "button", label: "Button file" }],
        },
      ]}
      onExpandedChange={onExpandedChange}
      onSelect={onSelect}
    />,
  );
  expect(screen.getByText("Button file")).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("button", { name: "Collapse Source" }));
  expect(onExpandedChange).toHaveBeenCalledTimes(1);
  expect(onExpandedChange).toHaveBeenCalledWith([]);
  fireEvent.press(screen.getByText("Source"));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith(["src"]);
});
