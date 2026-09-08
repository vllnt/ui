import { createRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";

import { Step, StepByStep } from "../components/step-by-step/step-by-step";
import { Tabs, TabsContent, TabsTrigger } from "../components/tabs/tabs";
import {
  TagsInput,
  type TagsInputProps,
} from "../components/tags-input/tags-input";
import { TimeField } from "../components/time-field/time-field";
import { TimePicker } from "../components/time-picker/time-picker";
import { TimelineScrubber } from "../components/timeline-scrubber/timeline-scrubber";
import { Tooltip } from "../components/tooltip/tooltip";

const tagLabels = {
  add: "Add",
  input: "Tags",
  remove: (tag: string) => `Remove ${tag}`,
};
const timeLabels = {
  close: "Close",
  hour: "Hours",
  minute: "Minutes",
  open: "Choose time",
  placeholder: "Choose",
};
const stepLabels = {
  progress: (done: number, total: number) => `${done}/${total}`,
  toggleStep: (title: string) => title,
};

describe("S–Z input and compound contracts", () => {
  it.each([{ editable: false }, { readOnly: true }, { disabled: true }])(
    "locks every tag mutation for %j",
    (locked) => {
      const onChange = jest.fn();
      const tags: TagsInputProps["tags"] = {
        defaultValue: ["one"],
        mode: "uncontrolled",
        onChange,
      };
      render(<TagsInput labels={tagLabels} tags={tags} testID="tags-input" />);
      fireEvent.changeText(screen.getByTestId("tags-input"), "two");
      screen.rerender(
        <TagsInput
          {...locked}
          labels={tagLabels}
          tags={tags}
          testID="tags-input"
        />,
      );
      expect(screen.getByTestId("tags-input")).toHaveProp("editable", false);
      fireEvent.press(screen.getByLabelText("Add"));
      fireEvent.press(screen.getByLabelText("Remove one"));
      fireEvent(screen.getByTestId("tags-input"), "submitEditing", {
        nativeEvent: { text: "two" },
      });
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it("commits normalized tags even when the array length is unchanged", () => {
    const onChange = jest.fn();
    render(
      <TagsInput
        labels={tagLabels}
        tags={{ mode: "controlled", onChange, value: [" one "] }}
        testID="tags-input"
      />,
    );
    fireEvent.changeText(screen.getByTestId("tags-input"), "one");
    fireEvent.press(screen.getByLabelText("Add"));
    expect(onChange).toHaveBeenCalledWith(["one"]);
  });

  it("offers a colon-capable keyboard and commits HH:mm", () => {
    const onChange = jest.fn();
    render(
      <TimeField
        labels={{ error: "Invalid time", input: "Time", placeholder: "HH:mm" }}
        valueState={{ defaultValue: undefined, mode: "uncontrolled", onChange }}
      />,
    );
    expect(screen.getByLabelText("Time")).toHaveProp("inputMode", "text");
    fireEvent(screen.getByLabelText("Time"), "focus", { nativeEvent: {} });
    fireEvent.changeText(screen.getByLabelText("Time"), "23:59");
    fireEvent(screen.getByLabelText("Time"), "submitEditing", {
      nativeEvent: {},
    });
    expect(onChange).toHaveBeenCalledWith("23:59");
  });

  it("treats invalid picker input as empty and recovers with a valid time", () => {
    const onChange = jest.fn();
    render(
      <TimePicker
        labels={timeLabels}
        selection={{ mode: "controlled", onChange, value: "99:99" }}
      />,
    );
    expect(screen.queryByText("99:99")).toBeNull();
    fireEvent.press(screen.getByLabelText("Choose time"));
    fireEvent.press(screen.getByRole("radio", { name: "01" }));
    expect(onChange).toHaveBeenCalledWith("01:00");
  });

  it("falls back to five-minute options for a non-finite step", () => {
    render(
      <TimePicker
        labels={timeLabels}
        minuteStep={Number.NaN}
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />,
    );
    fireEvent.press(screen.getByLabelText("Choose time"));
    expect(screen.getByRole("radio", { name: "55" })).toBeOnTheScreen();
  });

  it("counts only unique completion IDs belonging to current steps", () => {
    render(
      <StepByStep
        completedStepIds={["one", "one", "removed"]}
        interactive
        labels={stepLabels}
        title="Guide"
      >
        <Step id="one" title="One">
          <Text>Body</Text>
        </Step>
        <Step id="two" title="Two">
          <Text>Body two</Text>
        </Step>
      </StepByStep>,
    );
    expect(screen.getByText("1/2")).toBeOnTheScreen();
  });

  it("preserves interactive step view props, style and ref", () => {
    const ref = createRef<View>();
    render(
      <StepByStep interactive labels={stepLabels}>
        <Step
          id="one"
          ref={ref}
          style={{ marginTop: 12 }}
          testID="step-root"
          title="One"
        >
          <Text>Body</Text>
        </Step>
      </StepByStep>,
    );
    expect(screen.getByTestId("step-root")).toHaveStyle({ marginTop: 12 });
    expect(ref.current).not.toBeNull();
  });

  it("omits relationships when optional tab counterparts are absent", () => {
    render(
      <Tabs value="one">
        <TabsTrigger value="one">One</TabsTrigger>
      </Tabs>,
    );
    expect(screen.getByRole("tab").props["aria-controls"]).toBeUndefined();
    screen.rerender(
      <Tabs value="one">
        <TabsContent testID="panel" value="one">
          <Text>Panel</Text>
        </TabsContent>
      </Tabs>,
    );
    expect(
      screen.getByTestId("panel").props["aria-labelledby"],
    ).toBeUndefined();
  });

  it("registers mounted tab counterparts and removes stale relationships", () => {
    const tree = (panel: boolean) => (
      <Tabs id="tabs" value="one">
        <View>
          <TabsTrigger value="one">One</TabsTrigger>
        </View>
        {panel ? (
          <TabsContent testID="panel" value="one">
            <Text>Panel</Text>
          </TabsContent>
        ) : null}
      </Tabs>
    );
    render(tree(true));
    expect(screen.getByRole("tab")).toHaveProp(
      "aria-controls",
      "tabs-panel-one",
    );
    expect(screen.getByTestId("panel")).toHaveProp(
      "aria-labelledby",
      "tabs-tab-one",
    );
    screen.rerender(tree(false));
    expect(screen.getByRole("tab").props["aria-controls"]).toBeUndefined();
  });

  it("exposes the scrubber as an accessible adjustable target", () => {
    const onChange = jest.fn();
    render(
      <TimelineScrubber
        end={10}
        formatValue={String}
        labels={{ decrement: "Back", increment: "Forward", region: "Position" }}
        start={0}
        valueState={{ defaultValue: 3, mode: "uncontrolled", onChange }}
      />,
    );
    const target = screen.getByRole("adjustable", { name: "Position" });
    expect(target).toHaveProp("accessible", true);
    fireEvent(target, "accessibilityAction", {
      nativeEvent: { actionName: "increment" },
    });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("wraps tooltip scalar slots in native Text", () => {
    render(
      <Tooltip
        closeLabel="Close"
        defaultOpen
        helpHint="Open help"
        label="Details"
        trigger={0}
        triggerLabel="Help"
      >
        Explanation
      </Tooltip>,
    );
    expect(screen.getByText("0").type).toBe("Text");
    expect(screen.getByText("Explanation").type).toBe("Text");
  });
});
