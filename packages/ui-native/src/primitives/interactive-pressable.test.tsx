import { type ComponentProps, createRef } from "react";

import { fireEvent, screen } from "@testing-library/react-native";
import { lightTheme } from "@vllnt/ui-core";
import { Text, type View, type ViewStyle } from "react-native";

import { pressIn, renderThemed, styleOf } from "../tests/test-utils";

import { type InteractionState, interactionTokens } from "./interaction-state";
import { InteractivePressable } from "./interactive-pressable";

const tokens = interactionTokens(lightTheme);

function saveButton(): unknown {
  return screen.getByRole("button", { name: "Save" });
}

function saveStyle(): ViewStyle {
  return styleOf(saveButton());
}

function fire(event: string): void {
  fireEvent(saveButton(), event);
}

function renderPressable(
  props: Partial<ComponentProps<typeof InteractivePressable>> = {},
): void {
  renderThemed(
    <InteractivePressable
      accessibilityLabel="Save"
      accessibilityRole="button"
      {...props}
    >
      <Text>Save</Text>
    </InteractivePressable>,
  );
}

describe("InteractivePressable", () => {
  it("applies the 44 pt floor at rest and nothing else", () => {
    renderPressable();
    expect(saveStyle()).toEqual({
      minHeight: tokens.targetMin,
      minWidth: tokens.targetMin,
    });
  });

  it("shows the hover surface and chains the caller's hover handlers", () => {
    const onHoverIn = jest.fn();
    const onHoverOut = jest.fn();
    renderPressable({ onHoverIn, onHoverOut });
    fire("hoverIn");
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(saveStyle().backgroundColor).toBe(tokens.hoverSurface);
    fire("hoverOut");
    expect(onHoverOut).toHaveBeenCalledTimes(1);
    expect(saveStyle().backgroundColor).toBeUndefined();
  });

  it("dims a filled control on hover instead of tinting it", () => {
    renderPressable({ filled: true });
    fire("hoverIn");
    expect(saveStyle().opacity).toBe(tokens.hoverOpacity);
    expect(saveStyle().backgroundColor).toBeUndefined();
  });

  it("shows the focus ring and chains the caller's focus handlers", () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    renderPressable({ onBlur, onFocus });
    fire("focus");
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(saveStyle()).toMatchObject({
      outlineColor: lightTheme.colors.ring,
      outlineWidth: tokens.focusRing.width,
    });
    fire("blur");
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(saveStyle().outlineWidth).toBeUndefined();
  });

  it("dims while pressed", () => {
    renderPressable();
    pressIn(saveButton());
    expect(saveStyle().opacity).toBe(tokens.pressedOpacity);
  });

  it("marks a selected control with a border and keeps its press handler", () => {
    const onPress = jest.fn();
    renderPressable({ onPress, selected: true });
    expect(saveStyle()).toMatchObject({
      borderColor: tokens.selectedBorder.color,
      borderWidth: tokens.selectedBorder.width,
    });
    fireEvent.press(saveButton());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("dims a disabled control and ignores hover and focus", () => {
    renderPressable({ disabled: true });
    fire("hoverIn");
    fire("focus");
    expect(saveStyle()).toMatchObject({ opacity: tokens.disabledOpacity });
    expect(saveStyle().outlineWidth).toBeUndefined();
    expect(saveStyle().backgroundColor).toBeUndefined();
    expect(saveButton()).toHaveProp(
      "accessibilityState",
      expect.objectContaining({ disabled: true }),
    );
  });

  it("passes the full state to function style and function children", () => {
    const seen: InteractionState[] = [];
    renderThemed(
      <InteractivePressable
        accessibilityLabel="Save"
        accessibilityRole="button"
        selected
        style={(state) => {
          seen.push(state);
          return null;
        }}
      >
        {(state) => <Text>{state.selected ? "on" : "off"}</Text>}
      </InteractivePressable>,
    );
    expect(screen.getByText("on")).toBeOnTheScreen();
    expect(seen.at(-1)).toEqual({
      disabled: false,
      focused: false,
      hovered: false,
      pressed: false,
      selected: true,
    });
  });

  it("lets interaction states win over the caller's resting style", () => {
    renderPressable({ style: { backgroundColor: "red", opacity: 1 } });
    expect(saveStyle().backgroundColor).toBe("red");
    fire("hoverIn");
    expect(saveStyle().backgroundColor).toBe(tokens.hoverSurface);
  });

  it("forwards the ref and accessibility props", () => {
    const ref = createRef<View>();
    renderPressable({
      accessibilityHint: "Saves the draft",
      accessibilityState: { busy: true },
      ref,
    });
    expect(ref.current).not.toBeNull();
    expect(saveButton()).toHaveProp("accessibilityHint", "Saves the draft");
    expect(saveButton()).toHaveProp(
      "accessibilityState",
      expect.objectContaining({ busy: true }),
    );
  });
});
