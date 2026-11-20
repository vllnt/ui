import { fireEvent, screen } from "@testing-library/react-native";
import { lightTheme } from "@vllnt/ui-core";
import type { ReactElement } from "react";
import { Text, type ViewStyle } from "react-native";

import { Button } from "../components/atoms/button/button";
import { Calendar } from "../components/atoms/calendar/calendar";
import { Checkbox } from "../components/atoms/checkbox/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/atoms/collapsible/collapsible";
import { ListBox } from "../components/atoms/list-box/list-box";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/atoms/radio-group/radio-group";
import { SegmentedControl } from "../components/atoms/segmented-control/segmented-control";
import { TagGroup } from "../components/atoms/tag-group/tag-group";
import { Toggle } from "../components/atoms/toggle/toggle";
import { FloatingActionButton } from "../components/molecules/floating-action-button/floating-action-button";
import { Tabs, TabsList, TabsTrigger } from "../components/molecules/tabs/tabs";
import { interactionTokens } from "../primitives/interaction-state";

import { findHost, frameOf, type LayoutBox, layoutBox } from "./layout-box";
import { pressIn, reducedMotion, renderThemed, styleOf } from "./test-utils";

/**
 * Affordance contract (#633). Every interactive control shows every state of
 * the shared set through the interaction tokens, and no state changes a
 * control's outer box. Phase 1 covered Button, Toggle, Checkbox, RadioGroup
 * and SegmentedControl. Phase 2 moves every other component onto the same
 * primitive; the table also holds one representative of each group that
 * needs its own proof: a list row (ListBox), a tab, a calendar day, a tag, a
 * control with an icon and no text (FloatingActionButton) and a disclosure
 * trigger.
 */

const tokens = interactionTokens(lightTheme);
const noop = () => void 0;

type Control = {
  /** How hover shows: a tint on a transparent control, a dim on a filled one. */
  readonly hover: "dim" | "tint";
  readonly name: string;
  /** Renders the control with one unselected target the tests act on. */
  readonly render: (disabled: boolean) => ReactElement;
  readonly role: "button" | "checkbox" | "radio" | "tab" | "togglebutton";
  /** Renders the same control with that target selected; absent when it cannot be. */
  readonly selected?: () => ReactElement;
};

function segmented(disabled: boolean, selectedId = "grid"): ReactElement {
  return (
    <SegmentedControl
      disabled={disabled}
      items={[
        { id: "grid", label: "Grid" },
        { id: "list", label: "List" },
      ]}
      label="Layout"
      selection={{ defaultValue: selectedId, mode: "uncontrolled" }}
    />
  );
}

function delivery(disabled: boolean, selectedValue = "express"): ReactElement {
  return (
    <RadioGroup accessibilityLabel="Delivery" defaultValue={selectedValue}>
      <RadioGroupItem disabled={disabled} value="standard">
        Standard
      </RadioGroupItem>
      <RadioGroupItem value="express">Express</RadioGroupItem>
    </RadioGroup>
  );
}

const FRUIT = [
  { id: "apple", label: "Apple" },
  { id: "pear", label: "Pear" },
] as const;

function fruit(disabled: boolean, selectedId = "pear"): ReactElement {
  return (
    <ListBox
      disabled={disabled}
      label="Fruit"
      options={FRUIT}
      selection={{ defaultValue: new Set([selectedId]), mode: "uncontrolled" }}
    />
  );
}

const CALENDAR_LABELS = {
  formatDayAccessibilityLabel: (date: Date) => `Day ${date.getDate()}`,
  formatMonth: () => "November 2026",
  formatWeekday: (weekday: number) => `Weekday ${weekday}`,
  nextMonth: "Next month",
  previousMonth: "Previous month",
};

function november(disabled: boolean, selectedDay = 20): ReactElement {
  return (
    <Calendar
      disabled={disabled}
      labels={CALENDAR_LABELS}
      month={new Date(2026, 10, 1)}
      selection={{
        defaultValue: new Date(2026, 10, selectedDay),
        mode: "uncontrolled",
      }}
    />
  );
}

const TOPICS = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
] as const;

function topics(disabled: boolean, selectedId = "beta"): ReactElement {
  return (
    <TagGroup
      disabled={disabled}
      items={TOPICS}
      label="Topics"
      selection={{ defaultValue: new Set([selectedId]), mode: "uncontrolled" }}
    />
  );
}

function views(disabled: boolean, selectedValue = "grid"): ReactElement {
  return (
    <Tabs defaultValue={selectedValue}>
      <TabsList accessibilityLabel="Views">
        <TabsTrigger disabled={disabled} value="list">
          List
        </TabsTrigger>
        <TabsTrigger value="grid">Grid</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

const instantMotion = reducedMotion("pending");

function details(disabled: boolean, open = false): ReactElement {
  return (
    <Collapsible
      defaultOpen={open}
      disabled={disabled}
      id="details"
      reducedMotionService={instantMotion}
    >
      <CollapsibleTrigger label="Details">
        <Text>Details</Text>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Text>More</Text>
      </CollapsibleContent>
    </Collapsible>
  );
}

const CONTROLS: Readonly<Record<string, Control>> = {
  Button: {
    hover: "dim",
    name: "Save",
    render: (disabled) => (
      <Button disabled={disabled} onPress={noop}>
        Save
      </Button>
    ),
    role: "button",
  },
  "Calendar day": {
    hover: "tint",
    name: "Day 5",
    render: november,
    role: "button",
    selected: () => november(false, 5),
  },
  Checkbox: {
    hover: "tint",
    name: "Accept",
    render: (disabled) => (
      <Checkbox accessibilityLabel="Accept" disabled={disabled} />
    ),
    role: "checkbox",
    selected: () => <Checkbox accessibilityLabel="Accept" defaultChecked />,
  },
  CollapsibleTrigger: {
    hover: "tint",
    name: "Details",
    render: details,
    role: "button",
  },
  "Icon-only FloatingActionButton": {
    hover: "dim",
    name: "Create",
    render: (disabled) => (
      <FloatingActionButton
        accessibilityLabel="Create"
        disabled={disabled}
        onPress={noop}
      >
        +
      </FloatingActionButton>
    ),
    role: "button",
  },
  "ListBox option": {
    hover: "tint",
    name: "Apple",
    render: fruit,
    role: "radio",
    selected: () => fruit(false, "apple"),
  },
  RadioGroupItem: {
    hover: "tint",
    name: "Standard",
    render: delivery,
    role: "radio",
    selected: () => delivery(false, "standard"),
  },
  SegmentedControl: {
    hover: "dim",
    name: "List",
    render: segmented,
    role: "radio",
    selected: () => segmented(false, "list"),
  },
  "Tabs tab": {
    hover: "tint",
    name: "List",
    render: views,
    role: "tab",
    selected: () => views(false, "list"),
  },
  "TagGroup tag": {
    hover: "tint",
    name: "Alpha",
    render: topics,
    role: "togglebutton",
    selected: () => topics(false, "alpha"),
  },
  Toggle: {
    hover: "tint",
    name: "Bold",
    render: (disabled) => <Toggle disabled={disabled}>Bold</Toggle>,
    role: "togglebutton",
    selected: () => <Toggle defaultPressed>Bold</Toggle>,
  },
};

function targetStyle({ name, role }: Control): ViewStyle {
  return styleOf(screen.getByRole(role, { name }));
}

function fire({ name, role }: Control, event: string): void {
  fireEvent(screen.getByRole(role, { name }), event);
}

describe.each(Object.entries(CONTROLS))("%s", (_title, control) => {
  it("keeps the touch floor and shows nothing extra at rest", () => {
    renderThemed(control.render(false));
    const style = targetStyle(control);
    expect(style.minHeight).toBeGreaterThanOrEqual(tokens.targetMin);
    expect(style.minWidth).toBeGreaterThanOrEqual(tokens.targetMin);
    expect(style.outlineWidth).toBeUndefined();
    expect(style.opacity).toBeUndefined();
  });

  it("shows hover as a tint or a dim, and clears it on hover out", () => {
    renderThemed(control.render(false));
    const rest = targetStyle(control);
    fire(control, "hoverIn");
    const hovered = targetStyle(control);
    expect(hovered).not.toEqual(rest);
    if (control.hover === "dim") {
      expect(hovered.opacity).toBe(tokens.hoverOpacity);
    } else {
      expect(hovered.backgroundColor).toBe(tokens.hoverSurface);
      expect(rest.backgroundColor).not.toBe(tokens.hoverSurface);
    }
    fire(control, "hoverOut");
    expect(targetStyle(control)).toEqual(rest);
  });

  it("shows the focus ring", () => {
    renderThemed(control.render(false));
    fire(control, "focus");
    expect(targetStyle(control)).toMatchObject({
      outlineColor: lightTheme.colors.ring,
      outlineWidth: tokens.focusRing.width,
    });
  });

  it("dims while pressed", () => {
    renderThemed(control.render(false));
    pressIn(screen.getByRole(control.role, { name: control.name }));
    expect(targetStyle(control).opacity).toBe(tokens.pressedOpacity);
  });

  it("dims when disabled and ignores hover and focus", () => {
    renderThemed(control.render(true));
    const rest = targetStyle(control);
    expect(rest.opacity).toBe(tokens.disabledOpacity);
    fire(control, "hoverIn");
    fire(control, "focus");
    expect(targetStyle(control)).toEqual(rest);
  });
});

function boxOf({ name, role }: Control): LayoutBox {
  return layoutBox(findHost(role, name));
}

function hover(control: Control): void {
  fire(control, "hoverIn");
}

function focus(control: Control): void {
  fire(control, "focus");
}

function press(control: Control): void {
  pressIn(screen.getByRole(control.role, { name: control.name }));
}

const SINGLE_STATES = [
  ["hovered", hover],
  ["focused", focus],
  ["pressed", press],
] as const;

const SELECTABLE = Object.entries(CONTROLS).flatMap(([title, control]) =>
  control.selected ? [[title, control, control.selected] as const] : [],
);

describe.each(Object.entries(CONTROLS))("%s outer box", (_title, control) => {
  it.each(SINGLE_STATES)("is the same at rest and when %s", (_state, act) => {
    renderThemed(control.render(false));
    const rest = boxOf(control);
    act(control);
    expect(boxOf(control)).toEqual(rest);
  });

  it("is the same when hovered, focused and pressed together", () => {
    renderThemed(control.render(false));
    const rest = boxOf(control);
    hover(control);
    focus(control);
    press(control);
    expect(boxOf(control)).toEqual(rest);
  });

  it("is the same when disabled", () => {
    const { unmount } = renderThemed(control.render(false));
    const rest = boxOf(control);
    unmount();
    renderThemed(control.render(true));
    expect(boxOf(control)).toEqual(rest);
  });
});

describe.each(SELECTABLE)(
  "%s outer box when selected",
  (_title, control, renderSelected) => {
    it("is the same as when unselected", () => {
      const { unmount } = renderThemed(control.render(false));
      const rest = boxOf(control);
      unmount();
      renderThemed(renderSelected());
      expect(boxOf(control)).toEqual(rest);
    });

    it("is the same when selected, hovered, focused and pressed together", () => {
      const { unmount } = renderThemed(control.render(false));
      const rest = boxOf(control);
      unmount();
      renderThemed(renderSelected());
      hover(control);
      focus(control);
      press(control);
      expect(boxOf(control)).toEqual(rest);
    });
  },
);

describe("selection frame", () => {
  const SELECTED = {
    borderColor: tokens.selectedBorder.color,
    borderWidth: tokens.selectedBorder.width,
  };

  it("frames a pressed Toggle and leaves an unpressed one transparent", () => {
    renderThemed(
      <>
        <Toggle defaultPressed>On</Toggle>
        <Toggle>Off</Toggle>
      </>,
    );
    expect(frameOf(findHost("togglebutton", "On"))?.style).toMatchObject(
      SELECTED,
    );
    expect(frameOf(findHost("togglebutton", "Off"))?.style).toMatchObject({
      borderColor: "transparent",
      borderWidth: tokens.selectedBorder.width,
    });
  });

  it("frames the selected segment only", () => {
    renderThemed(segmented(false));
    expect(frameOf(findHost("radio", "Grid"))?.style).toMatchObject(SELECTED);
    expect(frameOf(findHost("radio", "List"))?.style.borderColor).toBe(
      "transparent",
    );
  });

  it("keeps an outline Toggle's own border and frames inside it", () => {
    renderThemed(
      <Toggle defaultPressed variant="outline">
        Bold
      </Toggle>,
    );
    const host = findHost("togglebutton", "Bold");
    expect(styleOf(host).borderWidth).toBe(1);
    expect(frameOf(host)?.style).toMatchObject({
      ...SELECTED,
      borderRadius: lightTheme.radius.md - 1,
    });
  });

  it("adds no frame to controls that show selection with a mark", () => {
    renderThemed(
      <>
        <Checkbox accessibilityLabel="Accept" defaultChecked />
        {delivery(false, "standard")}
      </>,
    );
    expect(frameOf(findHost("checkbox", "Accept"))).toBeUndefined();
    expect(frameOf(findHost("radio", "Standard"))).toBeUndefined();
  });
});

/**
 * Selectable controls whose selection shows by colour alone get the border
 * frame: a list row, a tab, a calendar day and a tag.
 */
const FRAMED = [
  "Calendar day",
  "ListBox option",
  "Tabs tab",
  "TagGroup tag",
] as const;

describe.each(FRAMED)("%s selection frame", (title) => {
  const control = CONTROLS[title];
  const renderSelected = control?.selected;
  if (control === undefined || renderSelected === undefined) {
    throw new Error(`${title} must be a selectable control`);
  }
  const frame = () => frameOf(findHost(control.role, control.name))?.style;

  it("is transparent while unselected and drawn once selected", () => {
    const { unmount } = renderThemed(control.render(false));
    expect(frame()).toMatchObject({
      borderColor: "transparent",
      borderWidth: tokens.selectedBorder.width,
    });
    unmount();
    renderThemed(renderSelected());
    expect(frame()).toMatchObject({
      borderColor: tokens.selectedBorder.color,
      borderWidth: tokens.selectedBorder.width,
    });
  });

  it("keeps the same frame width in every state", () => {
    renderThemed(control.render(false));
    const width = frame()?.borderWidth;
    hover(control);
    focus(control);
    press(control);
    expect(frame()?.borderWidth).toBe(width);
  });
});

function trigger() {
  return findHost("button", "Details");
}

describe("disclosure trigger", () => {
  it("keeps its expanded state and never draws a selection frame", () => {
    const { unmount } = renderThemed(details(false, false));
    expect(trigger().props.accessibilityState).toMatchObject({
      expanded: false,
    });
    expect(frameOf(trigger())).toBeUndefined();
    unmount();
    renderThemed(details(false, true));
    expect(trigger().props.accessibilityState).toMatchObject({
      expanded: true,
    });
    expect(frameOf(trigger())).toBeUndefined();
  });

  it("flips expanded on press and keeps the same box", () => {
    renderThemed(details(false, false));
    const rest = layoutBox(trigger());
    fireEvent.press(screen.getByRole("button", { name: "Details" }));
    expect(trigger().props.accessibilityState).toMatchObject({
      expanded: true,
    });
    expect(layoutBox(trigger())).toEqual(rest);
  });
});

describe("Button variants", () => {
  const variants = [
    ["default", lightTheme.colors.primary],
    ["destructive", lightTheme.colors.destructive],
    ["secondary", lightTheme.colors.secondary],
  ] as const;

  it.each(variants)(
    "dims a filled %s button on hover and keeps its own fill",
    (variant, fill) => {
      renderThemed(
        <Button onPress={noop} variant={variant}>
          Save
        </Button>,
      );
      fireEvent(screen.getByRole("button", { name: "Save" }), "hoverIn");
      const style = styleOf(screen.getByRole("button", { name: "Save" }));
      expect(style.opacity).toBe(tokens.hoverOpacity);
      expect(style.backgroundColor).toBe(fill);
    },
  );

  it("tints an outline button on hover", () => {
    renderThemed(
      <Button onPress={noop} variant="outline">
        Save
      </Button>,
    );
    fireEvent(screen.getByRole("button", { name: "Save" }), "hoverIn");
    expect(
      styleOf(screen.getByRole("button", { name: "Save" })).backgroundColor,
    ).toBe(tokens.hoverSurface);
  });

  it("underlines a ghost label on hover, focus and press, not at rest", () => {
    renderThemed(
      <Button onPress={noop} variant="ghost">
        Save
      </Button>,
    );
    const underline = () =>
      styleOf(screen.getByText("Save")).textDecorationLine;
    const emit = (event: string) => {
      fireEvent(screen.getByRole("button", { name: "Save" }), event);
    };
    expect(underline()).toBeUndefined();
    emit("hoverIn");
    expect(underline()).toBe("underline");
    emit("hoverOut");
    expect(underline()).toBeUndefined();
    emit("focus");
    expect(underline()).toBe("underline");
    emit("blur");
    expect(underline()).toBeUndefined();
    pressIn(screen.getByRole("button", { name: "Save" }));
    expect(underline()).toBe("underline");
  });

  it("never underlines a disabled ghost label", () => {
    renderThemed(
      <Button disabled onPress={noop} variant="ghost">
        Save
      </Button>,
    );
    fireEvent(screen.getByRole("button", { name: "Save" }), "hoverIn");
    expect(
      styleOf(screen.getByText("Save")).textDecorationLine,
    ).toBeUndefined();
  });

  it("keeps the icon button at the 44 pt floor", () => {
    renderThemed(
      <Button accessibilityLabel="Close" onPress={noop} size="icon">
        x
      </Button>,
    );
    const style = styleOf(screen.getByRole("button", { name: "Close" }));
    expect(style.height).toBeGreaterThanOrEqual(tokens.targetMin);
    expect(style.width).toBeGreaterThanOrEqual(tokens.targetMin);
  });
});
