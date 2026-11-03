import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
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
import { ThemeProvider } from "../theme/theme-provider";

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

it("resolves toggle group size and variant group first, then item, as on web", () => {
  renderThemed(
    <>
      <ToggleGroup size="lg" type="single" variant="outline">
        <ToggleGroupItem
          size="sm"
          testID="group-wins"
          value="a"
          variant="default"
        >
          A
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single">
        <ToggleGroupItem
          size="sm"
          testID="item-used"
          value="b"
          variant="outline"
        >
          B
        </ToggleGroupItem>
      </ToggleGroup>
    </>,
  );
  expect(screen.getByTestId("group-wins")).toHaveStyle({
    ...sizes.lg,
    borderWidth: 1,
  });
  expect(screen.getByTestId("item-used")).toHaveStyle({
    ...sizes.sm,
    borderWidth: 1,
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

const otp = (
  props: Partial<ComponentProps<typeof InputOTP>> & {
    readonly valueState: ComponentProps<typeof InputOTP>["valueState"];
  },
) => <InputOTP accessibilityLabel="Code" length={4} {...props} />;

it("locks an OTP input when disabled, even if the caller says enabled", () => {
  renderThemed(
    otp({
      accessibilityState: { disabled: false },
      disabled: true,
      valueState: { defaultValue: "", mode: "uncontrolled" },
    }),
  );
  const input = screen.getByLabelText("Code");
  expect(input.props.editable).toBe(false);
  expect(input.props.accessibilityState.disabled).toBe(true);
});

it("completes an uncontrolled OTP once per incomplete-to-complete change", () => {
  const onComplete = jest.fn();
  renderThemed(
    otp({
      onComplete,
      valueState: { defaultValue: "", mode: "uncontrolled" },
    }),
  );
  const input = screen.getByLabelText("Code");
  fireEvent.changeText(input, "123");
  expect(onComplete).not.toHaveBeenCalled();
  fireEvent.changeText(input, "1234");
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenLastCalledWith("1234");
  fireEvent.changeText(input, "");
  fireEvent.changeText(input, "5678");
  expect(onComplete).toHaveBeenCalledTimes(2);
  expect(onComplete).toHaveBeenLastCalledWith("5678");
});

it("completes a controlled OTP only when the committed value completes", () => {
  const onComplete = jest.fn();
  const onChange = jest.fn();
  const { rerender } = renderThemed(
    otp({
      onComplete,
      valueState: { mode: "controlled", onChange, value: "123" },
    }),
  );
  const input = screen.getByLabelText("Code");
  fireEvent.changeText(input, "1234");
  fireEvent.changeText(input, "1234");
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onComplete).not.toHaveBeenCalled();
  rerender(
    themed(
      otp({
        onComplete,
        valueState: { mode: "controlled", onChange, value: "1234" },
      }),
    ),
  );
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenLastCalledWith("1234");
  rerender(
    themed(
      otp({
        onComplete,
        valueState: { mode: "controlled", onChange, value: "1234" },
      }),
    ),
  );
  expect(onComplete).toHaveBeenCalledTimes(1);
  rerender(
    themed(
      otp({
        onComplete,
        valueState: { mode: "controlled", onChange, value: "" },
      }),
    ),
  );
  rerender(
    themed(
      otp({
        onComplete,
        valueState: { mode: "controlled", onChange, value: "9999" },
      }),
    ),
  );
  expect(onComplete).toHaveBeenCalledTimes(2);
});

it("does not report completion for an OTP that mounts complete", () => {
  const onComplete = jest.fn();
  renderThemed(
    otp({
      onComplete,
      valueState: { defaultValue: "1234", mode: "uncontrolled" },
    }),
  );
  expect(onComplete).not.toHaveBeenCalled();
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

it("keeps a flashcard controlled while reporting flips through the web name", () => {
  const onFlipChange = jest.fn();
  const { rerender } = renderThemed(
    <Flashcard
      answer="A"
      flipped={false}
      labels={flashcardLabels}
      onFlipChange={onFlipChange}
      question="Q"
      title="Card"
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "Reveal answer" }));
  expect(onFlipChange).toHaveBeenCalledTimes(1);
  expect(onFlipChange).toHaveBeenCalledWith(true);
  expect(
    screen.getByRole("button", { name: "Reveal answer" }),
  ).toBeOnTheScreen();
  rerender(
    themed(
      <Flashcard
        answer="A"
        flipped
        labels={flashcardLabels}
        onFlipChange={onFlipChange}
        question="Q"
        title="Card"
      />,
    ),
  );
  expect(screen.getByRole("button", { name: "Show prompt" })).toBeOnTheScreen();
});

const treeLabels = {
  collapseNode: (node: { readonly label: string }) => `Collapse ${node.label}`,
  expandNode: (node: { readonly label: string }) => `Expand ${node.label}`,
  region: "Files",
};
const treeNodes = [
  {
    id: "src",
    label: "Source",
    nodes: [{ id: "button", label: "Button file" }],
  },
];

it("controls a tree through the web names and reports changes", () => {
  const onExpandedChange = jest.fn();
  const onSelect = jest.fn();
  const { rerender } = renderThemed(
    <TreeView
      expanded={[]}
      labels={treeLabels}
      nodes={treeNodes}
      onExpandedChange={onExpandedChange}
      onSelect={onSelect}
      selected={[]}
    />,
  );
  expect(screen.queryByText("Button file")).toBeNull();
  fireEvent.press(screen.getByRole("button", { name: "Expand Source" }));
  expect(onExpandedChange).toHaveBeenLastCalledWith(["src"]);
  expect(screen.queryByText("Button file")).toBeNull();
  fireEvent.press(screen.getByText("Source"));
  expect(onSelect).toHaveBeenLastCalledWith(["src"]);
  rerender(
    themed(
      <TreeView
        expanded={["src"]}
        labels={treeLabels}
        nodes={treeNodes}
        onExpandedChange={onExpandedChange}
        onSelect={onSelect}
        selected={["src"]}
      />,
    ),
  );
  expect(screen.getByText("Button file")).toBeOnTheScreen();
});

it("prefers the native tree names when both are passed", () => {
  const onExpandedChange = jest.fn();
  const onExpandedIdsChange = jest.fn();
  renderThemed(
    <TreeView
      defaultExpanded={["src"]}
      defaultExpandedIds={[]}
      labels={treeLabels}
      nodes={treeNodes}
      onExpandedChange={onExpandedChange}
      onExpandedIdsChange={onExpandedIdsChange}
    />,
  );
  expect(screen.queryByText("Button file")).toBeNull();
  fireEvent.press(screen.getByRole("button", { name: "Expand Source" }));
  expect(onExpandedIdsChange).toHaveBeenCalledWith(["src"]);
  expect(onExpandedChange).not.toHaveBeenCalled();
});

it("takes rating glyph and large control sizes from the theme", () => {
  render(
    <ThemeProvider
      colorScheme="light"
      override={{
        spacing: { 12: 60 },
        typography: { scale: { h4: { fontSize: 30, lineHeight: 36 } } },
      }}
    >
      <Rating label="Score" labels={rated} max={1} size="lg" />
      <Toggle size="lg" testID="toggle">
        Bold
      </Toggle>
    </ThemeProvider>,
  );
  expect(screen.getByText("☆")).toHaveStyle({ fontSize: 30 });
  expect(screen.getByTestId("toggle")).toHaveStyle({ minHeight: 60 });
});
