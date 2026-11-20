import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";

import { Checkbox } from "../components/atoms/checkbox/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/atoms/radio-group/radio-group";
import { SegmentedControl } from "../components/atoms/segmented-control/segmented-control";
import { Slider } from "../components/atoms/slider/slider";
import { Switch } from "../components/atoms/switch/switch";

import { renderThemed, themed } from "./test-utils";

function labelOfInstance(instance: unknown): string | undefined {
  if (typeof instance !== "object" || instance === null) return undefined;
  if (!("props" in instance)) return undefined;
  const { props } = instance;
  return typeof props === "object" &&
    props !== null &&
    "accessibilityLabel" in props &&
    typeof props.accessibilityLabel === "string"
    ? props.accessibilityLabel
    : undefined;
}

/**
 * React Native's jest preset mocks `View` as a class whose `focus` is one
 * shared `jest.fn`, so `createNodeMock` never runs for it. Each call records
 * the instance it ran on (`mock.contexts`), which carries the item's props.
 */
function trackFocus() {
  const { focus } = View.prototype;
  if (!jest.isMockFunction(focus)) {
    throw new Error("Expected the React Native jest View mock.");
  }
  focus.mockClear();
  return {
    focused: (label: string) =>
      focus.mock.contexts.filter(
        (context) => labelOfInstance(context) === label,
      ).length,
  };
}

function key(name: string) {
  return { nativeEvent: { key: name } };
}

describe("required", () => {
  it("is spoken by a required checkbox and by nothing else", () => {
    renderThemed(
      <>
        <Checkbox label="Accept terms" required />
        <Checkbox label="Newsletter" />
        <Checkbox
          accessibilityHint="Opens the terms"
          label="Privacy"
          required
          requiredLabel="Obligatoire"
        />
      </>,
    );
    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toHaveProp(
      "accessibilityHint",
      "Required",
    );
    expect(screen.getByRole("checkbox", { name: "Newsletter" })).not.toHaveProp(
      "accessibilityHint",
    );
    expect(screen.getByRole("checkbox", { name: "Privacy" })).toHaveProp(
      "accessibilityHint",
      "Opens the terms. Obligatoire",
    );
  });

  it("is spoken by a required switch", () => {
    renderThemed(
      <>
        <Switch accessibilityLabel="Notify me" required />
        <Switch accessibilityLabel="Marketing" />
      </>,
    );
    expect(screen.getByRole("switch", { name: "Notify me" })).toHaveProp(
      "accessibilityHint",
      "Required",
    );
    expect(
      screen.getByRole("switch", { name: "Marketing" }).props.accessibilityHint,
    ).toBeUndefined();
  });

  it("is spoken by every radio of a required group, joined to the group label", () => {
    renderThemed(
      <RadioGroup accessibilityLabel="Plan" required>
        <RadioGroupItem accessibilityLabel="Free" value="free" />
        <RadioGroupItem accessibilityLabel="Pro" value="pro" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Free" })).toHaveProp(
      "accessibilityHint",
      "Plan. Required",
    );
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveProp(
      "accessibilityHint",
      "Plan. Required",
    );
  });

  it("is spoken only by the required radio of an optional group", () => {
    renderThemed(
      <RadioGroup accessibilityLabel="Plan">
        <RadioGroupItem accessibilityLabel="Free" value="free" />
        <RadioGroupItem accessibilityLabel="Pro" required value="pro" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Free" })).toHaveProp(
      "accessibilityHint",
      "Plan",
    );
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveProp(
      "accessibilityHint",
      "Plan. Required",
    );
  });
});

describe("Switch defaultChecked", () => {
  it("starts checked and then follows the user", () => {
    const onCheckedChange = jest.fn();
    renderThemed(
      <Switch
        accessibilityLabel="Notify me"
        defaultChecked
        onCheckedChange={onCheckedChange}
      />,
    );
    const toggle = screen.getByRole("switch", { name: "Notify me" });
    expect(toggle).toHaveProp("value", true);
    fireEvent(toggle, "valueChange", false);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("switch", { name: "Notify me" })).toHaveProp(
      "value",
      false,
    );
  });

  it("starts unchecked without it, and stays controlled when checked is passed", () => {
    renderThemed(
      <>
        <Switch accessibilityLabel="Plain" />
        <Switch accessibilityLabel="Locked" checked defaultChecked={false} />
      </>,
    );
    expect(screen.getByRole("switch", { name: "Plain" })).toHaveProp(
      "value",
      false,
    );
    const locked = screen.getByRole("switch", { name: "Locked" });
    fireEvent(locked, "valueChange", false);
    expect(screen.getByRole("switch", { name: "Locked" })).toHaveProp(
      "value",
      true,
    );
  });
});

describe("RadioGroup loop", () => {
  const plans = (loop?: boolean, onValueChange?: (value: unknown) => void) =>
    themed(
      <RadioGroup defaultValue="pro" loop={loop} onValueChange={onValueChange}>
        <RadioGroupItem accessibilityLabel="Free" value="free" />
        <RadioGroupItem accessibilityLabel="Pro" value="pro" />
        <RadioGroupItem accessibilityLabel="Team" disabled value="team" />
        <RadioGroupItem accessibilityLabel="Custom" value="custom" />
      </RadioGroup>,
    );

  it("moves focus and selection with the arrows, skipping a disabled radio", () => {
    const focus = trackFocus();
    const onValueChange = jest.fn();
    render(plans(undefined, onValueChange));
    fireEvent(
      screen.getByRole("radio", { name: "Pro" }),
      "keyDown",
      key("ArrowDown"),
    );
    expect(onValueChange).toHaveBeenLastCalledWith("custom");
    expect(focus.focused("Custom")).toBe(1);
    expect(screen.getByRole("radio", { name: "Custom" })).toBeChecked();
  });

  it("wraps from the last radio to the first by default", () => {
    const focus = trackFocus();
    const onValueChange = jest.fn();
    render(plans(undefined, onValueChange));
    fireEvent(
      screen.getByRole("radio", { name: "Custom" }),
      "keyDown",
      key("ArrowRight"),
    );
    expect(onValueChange).toHaveBeenLastCalledWith("free");
    expect(focus.focused("Free")).toBe(1);
  });

  it("stops at the ends when loop is false", () => {
    const focus = trackFocus();
    const onValueChange = jest.fn();
    render(plans(false, onValueChange));
    fireEvent(
      screen.getByRole("radio", { name: "Custom" }),
      "keyDown",
      key("ArrowRight"),
    );
    fireEvent(
      screen.getByRole("radio", { name: "Free" }),
      "keyDown",
      key("ArrowLeft"),
    );
    expect(onValueChange).not.toHaveBeenCalled();
    expect(focus.focused("Free")).toBe(0);
  });
});

describe("SegmentedControl", () => {
  const items = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { disabled: true, id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];
  const segmented = (
    props: Partial<Parameters<typeof SegmentedControl>[0]> = {},
  ) =>
    themed(
      <SegmentedControl
        items={items}
        label="Range"
        selection={{ defaultValue: "day", mode: "uncontrolled" }}
        {...props}
      />,
    );

  it("lays out horizontally by default and stacks when vertical", () => {
    renderThemed(
      <>
        <SegmentedControl
          items={items}
          label="Range"
          selection={{ defaultValue: "day", mode: "uncontrolled" }}
          testID="row"
        />
        <SegmentedControl
          items={items}
          label="Stacked"
          orientation="vertical"
          selection={{ defaultValue: "day", mode: "uncontrolled" }}
          testID="column"
        />
      </>,
    );
    expect(
      StyleSheet.flatten(screen.getByTestId("row").props.style).flexDirection,
    ).toBe("row");
    expect(
      StyleSheet.flatten(screen.getByTestId("column").props.style)
        .flexDirection,
    ).toBe("column");
  });

  it("moves focus, not selection, with the arrows and wraps by default", () => {
    const focus = trackFocus();
    render(segmented());
    fireEvent(
      screen.getByRole("radio", { name: "Day" }),
      "keyDown",
      key("ArrowRight"),
    );
    expect(focus.focused("Week")).toBe(1);
    expect(screen.getByRole("radio", { name: "Day" })).toBeChecked();
    fireEvent(
      screen.getByRole("radio", { name: "Year" }),
      "keyDown",
      key("ArrowRight"),
    );
    expect(focus.focused("Day")).toBe(1);
  });

  it("stops at the ends when loop is false", () => {
    const focus = trackFocus();
    render(segmented({ loop: false }));
    fireEvent(
      screen.getByRole("radio", { name: "Year" }),
      "keyDown",
      key("ArrowRight"),
    );
    expect(focus.focused("Day")).toBe(0);
  });

  it("ignores the arrows when rovingFocus is false", () => {
    const focus = trackFocus();
    render(segmented({ rovingFocus: false }));
    fireEvent(
      screen.getByRole("radio", { name: "Day" }),
      "keyDown",
      key("ArrowRight"),
    );
    expect(focus.focused("Week")).toBe(0);
  });

  it("answers only the arrows of its orientation", () => {
    const focus = trackFocus();
    render(segmented({ orientation: "vertical" }));
    fireEvent(
      screen.getByRole("radio", { name: "Day" }),
      "keyDown",
      key("ArrowRight"),
    );
    expect(focus.focused("Week")).toBe(0);
    fireEvent(
      screen.getByRole("radio", { name: "Day" }),
      "keyDown",
      key("ArrowDown"),
    );
    expect(focus.focused("Week")).toBe(1);
  });

  it("sizes an item by its own size before the control's size", () => {
    renderThemed(
      <SegmentedControl
        items={[
          { id: "a", label: "Alpha", size: "lg" },
          { id: "b", label: "Beta" },
        ]}
        label="Letters"
        selection={{ defaultValue: "a", mode: "uncontrolled" }}
        size="sm"
      />,
    );
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveStyle({
      minHeight: 48,
      paddingHorizontal: 16,
    });
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveStyle({
      minHeight: 44,
      paddingHorizontal: 8,
    });
  });
});

function layout(element: ReturnType<typeof screen.getByRole>) {
  fireEvent(element, "layout", {
    nativeEvent: { layout: { height: 100, width: 100, x: 0, y: 0 } },
  });
}

describe("Slider", () => {
  function drag(
    props: Partial<Parameters<typeof Slider>[0]>,
    start: { locationX?: number; locationY?: number },
  ) {
    const onValueChange = jest.fn();
    renderThemed(
      <Slider
        accessibilityLabel="Level"
        defaultValue={0}
        onValueChange={onValueChange}
        {...props}
      />,
    );
    const slider = screen.getByRole("adjustable", { name: "Level" });
    layout(slider);
    fireEvent(slider, "responderGrant", {
      nativeEvent: { locationX: 0, locationY: 0, ...start },
    });
    return onValueChange;
  }

  it("reads a horizontal slider from the start edge", () => {
    expect(drag({}, { locationX: 25 })).toHaveBeenLastCalledWith(25);
  });

  it("reads an inverted horizontal slider from the right", () => {
    expect(
      drag({ inverted: true }, { locationX: 25 }),
    ).toHaveBeenLastCalledWith(75);
  });

  it("reads a vertical slider from the bottom up", () => {
    expect(
      drag({ orientation: "vertical" }, { locationY: 25 }),
    ).toHaveBeenLastCalledWith(75);
  });

  it("reads an inverted vertical slider from the top down", () => {
    expect(
      drag({ inverted: true, orientation: "vertical" }, { locationY: 25 }),
    ).toHaveBeenLastCalledWith(25);
  });

  it("sizes a vertical slider as a column and places its thumb from the bottom", () => {
    renderThemed(
      <Slider accessibilityLabel="Level" orientation="vertical" value={25} />,
    );
    const slider = screen.getByRole("adjustable", { name: "Level" });
    expect(StyleSheet.flatten(slider.props.style)).toMatchObject({
      width: 44,
    });
    const thumb = slider.children[1];
    if (typeof thumb === "string") throw new Error("Expected a thumb view.");
    expect(StyleSheet.flatten(thumb.props.style).top).toBe("75%");
  });

  it("commits once at the end of a drag that changed the value", () => {
    const onValueCommit = jest.fn();
    renderThemed(
      <Slider
        accessibilityLabel="Level"
        defaultValue={0}
        onValueCommit={onValueCommit}
      />,
    );
    const slider = screen.getByRole("adjustable", { name: "Level" });
    layout(slider);
    fireEvent(slider, "responderGrant", { nativeEvent: { locationX: 75 } });
    fireEvent(slider, "responderMove", { nativeEvent: { locationX: 50 } });
    expect(onValueCommit).not.toHaveBeenCalled();
    fireEvent(slider, "responderRelease", { nativeEvent: { locationX: 50 } });
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(50);
  });

  it("does not commit a drag that ends where it started, and commits when cancelled", () => {
    const onValueCommit = jest.fn();
    renderThemed(
      <Slider
        accessibilityLabel="Level"
        defaultValue={50}
        onValueCommit={onValueCommit}
      />,
    );
    const slider = screen.getByRole("adjustable", { name: "Level" });
    layout(slider);
    fireEvent(slider, "responderGrant", { nativeEvent: { locationX: 50 } });
    fireEvent(slider, "responderRelease", { nativeEvent: { locationX: 50 } });
    expect(onValueCommit).not.toHaveBeenCalled();
    fireEvent(slider, "responderGrant", { nativeEvent: { locationX: 10 } });
    fireEvent(slider, "responderTerminate", { nativeEvent: { locationX: 10 } });
    expect(onValueCommit).toHaveBeenCalledWith(10);
  });

  it("commits each screen-reader adjustment, and never when disabled", () => {
    const onValueCommit = jest.fn();
    const onDisabledCommit = jest.fn();
    renderThemed(
      <>
        <Slider
          accessibilityLabel="Level"
          max={10}
          onValueCommit={onValueCommit}
          value={5}
        />
        <Slider
          accessibilityLabel="Locked"
          disabled
          onValueCommit={onDisabledCommit}
          value={5}
        />
      </>,
    );
    fireEvent(
      screen.getByRole("adjustable", { name: "Level" }),
      "accessibilityAction",
      { nativeEvent: { actionName: "increment" } },
    );
    expect(onValueCommit).toHaveBeenCalledWith(6);
    const locked = screen.getByRole("adjustable", { name: "Locked" });
    fireEvent(locked, "accessibilityAction", {
      nativeEvent: { actionName: "increment" },
    });
    expect(onDisabledCommit).not.toHaveBeenCalled();
  });
});
