import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Text as NativeText, type ViewProps } from "react-native";

import { AnimatedTabs } from "../components/animated-tabs/animated-tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/collapsible/collapsible";
import {
  DateField,
  type ISODateString,
} from "../components/date-field/date-field";
import { InlineInput } from "../components/inline-input/inline-input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/resizable/resizable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/tabs/tabs";
import {
  type ISOTimeString,
  TimeField,
} from "../components/time-field/time-field";
import { TimelineScrubber } from "../components/timeline-scrubber/timeline-scrubber";
import { ViewSwitcher } from "../components/view-switcher/view-switcher";
import type { ReducedMotionService } from "../primitives/use-reduced-motion";

const reducedMotionService: ReducedMotionService = {
  addEventListener: () => ({ remove: jest.fn() }),
  isReduceMotionEnabled: () => new Promise(() => void 0),
};

const dateLabels = {
  error: "Enter a valid date",
  input: "Start date",
  placeholder: "YYYY-MM-DD",
};

const timeLabels = {
  error: "Enter a valid time",
  input: "Start time",
  placeholder: "HH:mm",
};

function renderControlledDate(value?: ISODateString): ReactElement {
  return (
    <DateField labels={dateLabels} valueState={{ mode: "controlled", value }} />
  );
}

function renderControlledTime(value?: ISOTimeString): ReactElement {
  return (
    <TimeField labels={timeLabels} valueState={{ mode: "controlled", value }} />
  );
}

describe("reviewed native state correctness", () => {
  it("only points disclosure and tab controls at mounted content", () => {
    render(
      <>
        <Collapsible id="details" reducedMotionService={reducedMotionService}>
          <CollapsibleTrigger label="Details">
            <NativeText>Toggle</NativeText>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <NativeText>Disclosure content</NativeText>
          </CollapsibleContent>
        </Collapsible>
        <Tabs defaultValue="first" id="sections">
          <TabsList>
            <TabsTrigger value="first">First</TabsTrigger>
            <TabsTrigger value="second">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="first">
            <NativeText>First content</NativeText>
          </TabsContent>
          <TabsContent value="second">
            <NativeText>Second content</NativeText>
          </TabsContent>
        </Tabs>
      </>,
    );

    const disclosure = screen.getByRole("button", { name: "Details" });
    expect(disclosure).not.toHaveProp("aria-controls");
    fireEvent.press(disclosure);
    expect(disclosure).toHaveProp("aria-controls", "details-content");

    const first = screen.getByRole("tab", { name: "First" });
    const second = screen.getByRole("tab", { name: "Second" });
    expect(first).toHaveProp("aria-controls", "sections-panel-first");
    expect(second).not.toHaveProp("aria-controls");
    fireEvent.press(second);
    expect(first).not.toHaveProp("aria-controls");
    expect(second).toHaveProp("aria-controls", "sections-panel-second");
  });

  it("only relates selected animated and switched tabs to semantic-free panels", () => {
    render(
      <>
        <AnimatedTabs
          defaultValue="code"
          id="preview"
          reducedMotionService={reducedMotionService}
          tabs={[
            {
              label: "Code",
              panel: <NativeText>Code panel</NativeText>,
              value: "code",
            },
            {
              label: "Preview",
              panel: <NativeText>Preview panel</NativeText>,
              value: "preview",
            },
          ]}
        />
        <ViewSwitcher
          defaultValue="grid"
          id="layout"
          options={[
            {
              key: "grid",
              label: "Grid",
              panel: <NativeText>Grid panel</NativeText>,
            },
            {
              key: "list",
              label: "List",
              panel: <NativeText>List panel</NativeText>,
            },
          ]}
        />
      </>,
    );

    expect(screen.getByRole("tab", { name: "Code" })).toHaveProp(
      "aria-controls",
      "preview-panel-code",
    );
    expect(screen.getByRole("tab", { name: "Preview" })).not.toHaveProp(
      "aria-controls",
    );
    expect(screen.getByRole("tab", { name: "Grid" })).toHaveProp(
      "aria-controls",
      "layout-panel-grid",
    );
    expect(screen.getByRole("tab", { name: "List" })).not.toHaveProp(
      "aria-controls",
    );
    expect(screen.queryByRole("summary")).toBeNull();
  });

  it("keeps timeline invariants and normalizes a nonpositive step", () => {
    const onChange = jest.fn();
    const callerAction = jest.fn();
    const extraViewProps: ViewProps = {
      accessibilityActions: [{ name: "activate" }],
      accessibilityLabel: "Caller override",
      accessibilityRole: "summary",
      accessibilityValue: { now: 999 },
      onAccessibilityAction: callerAction,
      testID: "timeline",
    };
    render(
      <TimelineScrubber
        {...extraViewProps}
        end={10}
        formatValue={(value) => `${value} seconds`}
        labels={{
          decrement: "Earlier",
          increment: "Later",
          region: "Playback position",
        }}
        start={0}
        step={0}
        valueState={{
          defaultValue: 5,
          mode: "uncontrolled",
          onChange,
        }}
      />,
    );

    const timeline = screen.getByTestId("timeline");
    expect(timeline).toHaveProp("accessibilityLabel", "Playback position");
    expect(timeline).toHaveProp("accessibilityRole", "adjustable");
    expect(timeline).toHaveAccessibilityValue({
      max: 10,
      min: 0,
      now: 5,
      text: "5 seconds",
    });
    fireEvent(timeline, "accessibilityAction", {
      nativeEvent: { actionName: "increment" },
    });
    expect(onChange).toHaveBeenCalledWith(6);
    expect(callerAction).not.toHaveBeenCalled();
  });

  it("renormalizes resizable state when panels and constraints change", () => {
    const { rerender } = render(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={50} testID="first-panel" />
        <ResizableHandle />
        <ResizablePanel defaultSize={50} testID="second-panel" />
      </ResizablePanelGroup>,
    );

    rerender(
      <ResizablePanelGroup>
        <ResizablePanel
          defaultSize={70}
          maxSize={40}
          minSize={30}
          testID="first-panel"
        />
        <ResizableHandle />
        <ResizablePanel defaultSize={30} minSize={20} testID="second-panel" />
      </ResizablePanelGroup>,
    );

    expect(screen.getByTestId("first-panel")).toHaveStyle({ flexGrow: 40 });
    expect(screen.getByTestId("second-panel")).toHaveStyle({ flexGrow: 60 });

    rerender(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={40} testID="first-panel" />
        <ResizableHandle />
        <ResizablePanel defaultSize={30} testID="second-panel" />
        <ResizableHandle />
        <ResizablePanel defaultSize={30} testID="third-panel" />
      </ResizablePanelGroup>,
    );

    expect(screen.getByTestId("first-panel")).toHaveStyle({ flexGrow: 40 });
    expect(screen.getByTestId("second-panel")).toHaveStyle({ flexGrow: 30 });
    expect(screen.getByTestId("third-panel")).toHaveStyle({ flexGrow: 30 });
  });

  it("shows an empty controlled date and time after an external clear", () => {
    const date = render(renderControlledDate("2026-04-15"));
    const dateInput = screen.getByLabelText("Start date");
    fireEvent(dateInput, "focus", { nativeEvent: {} });
    fireEvent.changeText(dateInput, "2026-05-20");
    fireEvent(dateInput, "blur", { nativeEvent: {} });
    date.rerender(renderControlledDate());
    expect(screen.getByLabelText("Start date")).toHaveProp("value", "");
    date.unmount();

    const time = render(renderControlledTime("09:30"));
    const timeInput = screen.getByLabelText("Start time");
    fireEvent(timeInput, "focus", { nativeEvent: {} });
    fireEvent.changeText(timeInput, "10:45");
    fireEvent(timeInput, "blur", { nativeEvent: {} });
    time.rerender(renderControlledTime());
    expect(screen.getByLabelText("Start time")).toHaveProp("value", "");
  });

  it("refreshes the inline edit baseline whenever editing starts", () => {
    const onCancel = jest.fn();
    const onCommit = jest.fn();
    const onChangeText = jest.fn();
    const { rerender } = render(
      <InlineInput
        accessibilityLabel="Title"
        onCancel={onCancel}
        onChangeText={onChangeText}
        onCommit={onCommit}
        value="Initial"
      />,
    );

    rerender(
      <InlineInput
        accessibilityLabel="Title"
        onCancel={onCancel}
        onChangeText={onChangeText}
        onCommit={onCommit}
        value="Externally updated"
      />,
    );
    const input = screen.getByLabelText("Title");
    fireEvent(input, "focus", { nativeEvent: {} });
    fireEvent(input, "blur", { nativeEvent: {} });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });
});
