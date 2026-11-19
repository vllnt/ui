import { fireEvent, screen } from "@testing-library/react-native";
import { lightTheme } from "@vllnt/ui-core";
import type { ReactElement } from "react";
import type { ViewStyle } from "react-native";

import { Button } from "../components/atoms/button/button";
import { Checkbox } from "../components/atoms/checkbox/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/atoms/radio-group/radio-group";
import { SegmentedControl } from "../components/atoms/segmented-control/segmented-control";
import { Toggle } from "../components/atoms/toggle/toggle";
import { interactionTokens } from "../primitives/interaction-state";

import { pressIn, renderThemed, styleOf } from "./test-utils";

/**
 * Affordance contract (#633), phase 1: Button, Toggle, Checkbox, RadioGroup
 * and SegmentedControl show every state of the shared set through the
 * interaction tokens.
 */

const tokens = interactionTokens(lightTheme);
const noop = () => void 0;

type Control = {
  /** How hover shows: a tint on a transparent control, a dim on a filled one. */
  readonly hover: "dim" | "tint";
  readonly name: string;
  /** Renders the control with one unselected target the tests act on. */
  readonly render: (disabled: boolean) => ReactElement;
  readonly role: "button" | "checkbox" | "radio" | "togglebutton";
};

function segmented(disabled: boolean): ReactElement {
  return (
    <SegmentedControl
      disabled={disabled}
      items={[
        { id: "grid", label: "Grid" },
        { id: "list", label: "List" },
      ]}
      label="Layout"
      selection={{ defaultValue: "grid", mode: "uncontrolled" }}
    />
  );
}

const CONTROLS: Readonly<Record<string, Control>> = {
  Checkbox: {
    hover: "tint",
    name: "Accept",
    render: (disabled) => (
      <Checkbox accessibilityLabel="Accept" disabled={disabled} />
    ),
    role: "checkbox",
  },
  RadioGroupItem: {
    hover: "tint",
    name: "Standard",
    render: (disabled) => (
      <RadioGroup accessibilityLabel="Delivery" defaultValue="express">
        <RadioGroupItem disabled={disabled} value="standard">
          Standard
        </RadioGroupItem>
        <RadioGroupItem value="express">Express</RadioGroupItem>
      </RadioGroup>
    ),
    role: "radio",
  },
  SegmentedControl: {
    hover: "dim",
    name: "List",
    render: segmented,
    role: "radio",
  },
  Toggle: {
    hover: "tint",
    name: "Bold",
    render: (disabled) => <Toggle disabled={disabled}>Bold</Toggle>,
    role: "togglebutton",
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

describe("selected cue", () => {
  it("thickens the border of a pressed Toggle only", () => {
    renderThemed(
      <>
        <Toggle defaultPressed>On</Toggle>
        <Toggle>Off</Toggle>
      </>,
    );
    expect(
      styleOf(screen.getByRole("togglebutton", { name: "On" })).borderWidth,
    ).toBe(tokens.selectedBorder.width);
    expect(
      styleOf(screen.getByRole("togglebutton", { name: "Off" })).borderWidth,
    ).toBe(0);
  });

  it("thickens the border of the selected segment only", () => {
    renderThemed(segmented(false));
    expect(
      styleOf(screen.getByRole("radio", { name: "Grid" })).borderWidth,
    ).toBe(tokens.selectedBorder.width);
    expect(
      styleOf(screen.getByRole("radio", { name: "List" })).borderWidth,
    ).toBeUndefined();
  });
});

describe("Button", () => {
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
