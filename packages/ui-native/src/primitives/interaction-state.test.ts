import { createNativeTheme, lightTheme } from "@vllnt/ui-core";

import { controlSizeStyle, targetFloorStyle } from "./control-size";
import {
  type InteractionState,
  interactionStyle,
  interactionTokens,
} from "./interaction-state";

const darkTheme = createNativeTheme("dark");
const themes = [
  ["light", lightTheme],
  ["dark", darkTheme],
] as const;
const REST = interactionStyle(lightTheme, {});
const COLOUR_KEYS = new Set(["backgroundColor", "borderColor", "outlineColor"]);
const STATES = [
  "disabled",
  "focused",
  "hovered",
  "pressed",
  "selected",
] as const satisfies readonly (keyof InteractionState)[];

function nonColourKeys(style: object): string[] {
  return Object.keys(style).filter((key) => !COLOUR_KEYS.has(key));
}

describe("interactionStyle", () => {
  it("leaves a control at rest untouched", () => {
    expect(REST).toEqual({});
  });

  it.each(STATES)("%s differs from rest", (name) => {
    expect(interactionStyle(lightTheme, { [name]: true })).not.toEqual(REST);
  });

  it("gives every state a distinct style", () => {
    const styles = STATES.map((name) =>
      JSON.stringify(interactionStyle(lightTheme, { [name]: true })),
    );
    expect(new Set(styles).size).toBe(STATES.length);
  });

  it.each(themes)("reads every value from the %s tokens", (_name, theme) => {
    const tokens = interactionTokens(theme);
    expect(interactionStyle(theme, { pressed: true }).opacity).toBe(
      tokens.pressedOpacity,
    );
    expect(interactionStyle(theme, { disabled: true }).opacity).toBe(
      tokens.disabledOpacity,
    );
    expect(interactionStyle(theme, { hovered: true }).backgroundColor).toBe(
      tokens.hoverSurface,
    );
    expect(tokens.hoverSurface).toBe(theme.colors.accent);
    expect(interactionStyle(theme, { focused: true })).toMatchObject({
      outlineColor: tokens.focusRing.color,
      outlineOffset: tokens.focusRing.offset,
      outlineWidth: tokens.focusRing.width,
    });
    expect(tokens.focusRing.color).toBe(theme.colors.ring);
    expect(interactionStyle(theme, { selected: true })).toEqual({
      borderColor: tokens.selectedBorder.color,
      borderWidth: tokens.selectedBorder.width,
    });
  });

  it("shows focus and selection with a cue that is not a colour", () => {
    const focus = interactionStyle(lightTheme, { focused: true });
    const selected = interactionStyle(lightTheme, { selected: true });
    expect(nonColourKeys(focus)).toEqual(
      expect.arrayContaining(["outlineWidth"]),
    );
    expect(focus.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(nonColourKeys(selected)).toEqual(["borderWidth"]);
    expect(selected.borderWidth).toBeGreaterThanOrEqual(2);
  });

  it("dims a filled control on hover instead of tinting it", () => {
    const style = interactionStyle(
      lightTheme,
      { hovered: true },
      { filled: true },
    );
    expect(style).toEqual({
      opacity: interactionTokens(lightTheme).hoverOpacity,
    });
  });

  it("lets pressed win over hover when both are active", () => {
    const style = interactionStyle(
      lightTheme,
      { hovered: true, pressed: true },
      { filled: true },
    );
    expect(style.opacity).toBe(interactionTokens(lightTheme).pressedOpacity);
  });

  it("lets disabled win over hover, press and focus", () => {
    const style = interactionStyle(lightTheme, {
      disabled: true,
      focused: true,
      hovered: true,
      pressed: true,
    });
    expect(style).toEqual({
      opacity: interactionTokens(lightTheme).disabledOpacity,
    });
  });

  it("keeps the selected cue on a disabled or hovered control", () => {
    const cue = interactionStyle(lightTheme, { selected: true });
    expect(
      interactionStyle(lightTheme, { disabled: true, selected: true }),
    ).toMatchObject(cue);
    const hovered = interactionStyle(lightTheme, {
      hovered: true,
      selected: true,
    });
    expect(hovered).toEqual(cue);
  });
});

describe("target floor", () => {
  it("holds the 44 pt touch floor from the tokens", () => {
    const { targetMin } = interactionTokens(lightTheme);
    expect(targetMin).toBe(44);
    expect(targetFloorStyle(lightTheme)).toEqual({
      minHeight: targetMin,
      minWidth: targetMin,
    });
  });

  it.each(["default", "lg", "sm"] as const)(
    "never sizes a %s control below the floor",
    (size) => {
      const { minHeight } = controlSizeStyle(lightTheme, size);
      expect(minHeight).toBeGreaterThanOrEqual(
        interactionTokens(lightTheme).targetMin,
      );
    },
  );
});
