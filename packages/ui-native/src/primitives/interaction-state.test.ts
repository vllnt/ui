import { createNativeTheme, lightTheme } from "@vllnt/ui-core";

import { controlSizeStyle, targetFloorStyle } from "./control-size";
import {
  type InteractionState,
  interactionStyle,
  interactionTokens,
  selectedFrameStyle,
} from "./interaction-state";

const darkTheme = createNativeTheme("dark");
const themes = [
  ["light", lightTheme],
  ["dark", darkTheme],
] as const;
const REST = interactionStyle(lightTheme, {});
const COLOUR_KEYS = new Set(["backgroundColor", "borderColor", "outlineColor"]);
const PAINT_KEYS = new Set([
  "backgroundColor",
  "opacity",
  "outlineColor",
  "outlineOffset",
  "outlineStyle",
  "outlineWidth",
]);
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

/** Every combination of the five state flags. */
function stateCombinations(): Partial<InteractionState>[] {
  return Array.from({ length: 2 ** STATES.length }, (_, mask) =>
    Object.fromEntries(
      STATES.map((name, index) => [name, (mask >> index) % 2 === 1]),
    ),
  );
}

describe("interactionStyle", () => {
  it("leaves a control at rest untouched", () => {
    expect(REST).toEqual({});
  });

  it.each(STATES.filter((name) => name !== "selected"))(
    "%s differs from rest",
    (name) => {
      expect(interactionStyle(lightTheme, { [name]: true })).not.toEqual(REST);
    },
  );

  it("gives every painted state a distinct style", () => {
    const painted = STATES.filter((name) => name !== "selected");
    const styles = painted.map((name) =>
      JSON.stringify(interactionStyle(lightTheme, { [name]: true })),
    );
    expect(new Set(styles).size).toBe(painted.length);
  });

  it("leaves the selected cue to the frame", () => {
    expect(interactionStyle(lightTheme, { selected: true })).toEqual({});
  });

  it.each([false, true])(
    "only paints, in every state combination (filled: %s)",
    (filled) => {
      for (const state of stateCombinations()) {
        const keys = Object.keys(
          interactionStyle(lightTheme, state, { filled }),
        );
        expect(keys.filter((key) => !PAINT_KEYS.has(key))).toEqual([]);
      }
    },
  );

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
  });

  it("shows focus with a cue that is not a colour", () => {
    const focus = interactionStyle(lightTheme, { focused: true });
    expect(nonColourKeys(focus)).toEqual(
      expect.arrayContaining(["outlineWidth"]),
    );
    expect(focus.outlineWidth).toBeGreaterThanOrEqual(2);
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

  it("keeps a selected control's own surface on hover", () => {
    expect(
      interactionStyle(lightTheme, { hovered: true, selected: true }),
    ).toEqual({});
  });
});

describe("selectedFrameStyle", () => {
  it("lies out of the flow and fills the padding box", () => {
    expect(selectedFrameStyle(lightTheme, true)).toMatchObject({
      bottom: 0,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
    });
  });

  it("keeps one border width whether selected or not", () => {
    const rest = selectedFrameStyle(lightTheme, false);
    const selected = selectedFrameStyle(lightTheme, true);
    expect(rest.borderWidth).toBe(selected.borderWidth);
    expect(selected.borderWidth).toBeGreaterThanOrEqual(2);
  });

  it("is invisible at rest and drawn when selected", () => {
    const tokens = interactionTokens(lightTheme);
    expect(selectedFrameStyle(lightTheme, false).borderColor).toBe(
      "transparent",
    );
    expect(selectedFrameStyle(lightTheme, true).borderColor).toBe(
      tokens.selectedBorder.color,
    );
  });

  it.each(themes)("reads the %s tokens", (_name, theme) => {
    const { selectedBorder } = interactionTokens(theme);
    expect(selectedFrameStyle(theme, true)).toMatchObject({
      borderColor: selectedBorder.color,
      borderWidth: selectedBorder.width,
    });
    expect(selectedBorder.color).toBe(theme.colors.foreground);
  });

  it("follows the control's corners inside the control's own border", () => {
    expect(selectedFrameStyle(lightTheme, true).borderRadius).toBe(0);
    expect(
      selectedFrameStyle(lightTheme, true, { borderRadius: 8 }).borderRadius,
    ).toBe(8);
    expect(
      selectedFrameStyle(lightTheme, true, { borderRadius: 8, borderWidth: 1 })
        .borderRadius,
    ).toBe(7);
    expect(
      selectedFrameStyle(lightTheme, true, { borderRadius: 2, borderWidth: 4 })
        .borderRadius,
    ).toBe(0);
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
