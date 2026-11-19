import type { NativeTheme } from "@vllnt/ui-core";
import type { ViewStyle } from "react-native";

/**
 * The affordance contract's state set (#633). A control at rest has every flag
 * false; `focused` is any focus, because React Native has no `:focus-visible`.
 */
export type InteractionState = {
  readonly disabled: boolean;
  readonly focused: boolean;
  readonly hovered: boolean;
  readonly pressed: boolean;
  readonly selected: boolean;
};

/** Visual values every interactive native control reads its states from. */
export type InteractionTokens = {
  readonly disabledOpacity: number;
  /** Focus ring drawn as an outline, so focusing never shifts layout. */
  readonly focusRing: {
    readonly color: string;
    readonly offset: number;
    readonly width: number;
  };
  /** Hover dim for controls that paint their own fill. */
  readonly hoverOpacity: number;
  /** Hover fill for controls that rest on a transparent surface. */
  readonly hoverSurface: string;
  readonly pressedOpacity: number;
  /**
   * Selected cue that does not rely on colour: a border drawn by the selection
   * frame inside the control's box, so selecting never changes its size.
   */
  readonly selectedBorder: {
    readonly color: string;
    readonly width: number;
  };
  /** Touch target floor in points. */
  readonly targetMin: number;
};

/** Optional hints that change how a control paints its states. */
export type InteractionStyleOptions = {
  /**
   * The control paints its own fill, so hover dims it instead of tinting.
   * Needed wherever the fill already equals the hover surface: `accent`,
   * `muted` and `secondary` share one colour in every theme.
   */
  readonly filled?: boolean;
};

/**
 * State tokens for 0.1.0, derived from the theme's semantic colours. The
 * opacities, widths and the 44 pt floor are local constants until ui-core
 * ships state and target tokens (0.5.0 spatial RFC); this is the one place to
 * swap them.
 *
 * @param theme - Active native theme supplying `ring`, `accent` and `foreground`.
 * @returns The state tokens for that theme.
 * @example
 * interactionTokens(lightTheme).targetMin; // 44
 */
function interactionTokens(theme: NativeTheme): InteractionTokens {
  return {
    disabledOpacity: 0.5,
    focusRing: { color: theme.colors.ring, offset: 2, width: 2 },
    hoverOpacity: 0.9,
    hoverSurface: theme.colors.accent,
    pressedOpacity: 0.8,
    selectedBorder: { color: theme.colors.foreground, width: 2 },
    targetMin: 44,
  };
}

function focusStyle(tokens: InteractionTokens): ViewStyle {
  return {
    outlineColor: tokens.focusRing.color,
    outlineOffset: tokens.focusRing.offset,
    outlineStyle: "solid",
    outlineWidth: tokens.focusRing.width,
  };
}

function hoverStyle(
  tokens: InteractionTokens,
  options: InteractionStyleOptions,
): ViewStyle {
  return options.filled === true
    ? { opacity: tokens.hoverOpacity }
    : { backgroundColor: tokens.hoverSurface };
}

/**
 * Style delta a state set applies on top of a control's resting style.
 * Disabled wins over hover, press and focus; a selected control keeps its own
 * surface on hover. No state touches width, height, padding or border, so no
 * state changes the control's box; the selection cue is
 * {@link selectedFrameStyle}. Pure and motion-free, so safe under reduced
 * motion.
 *
 * @param theme - Active native theme.
 * @param state - Which states are active; omitted flags count as false.
 * @param options - Paint hints such as `filled`.
 * @returns The style to layer over the control's resting style.
 * @example
 * interactionStyle(theme, { focused: true }).outlineWidth; // 2
 */
function interactionStyle(
  theme: NativeTheme,
  state: Partial<InteractionState>,
  options: InteractionStyleOptions = {},
): ViewStyle {
  const tokens = interactionTokens(theme);
  if (state.disabled === true) return { opacity: tokens.disabledOpacity };
  return {
    ...(state.hovered === true && state.selected !== true
      ? hoverStyle(tokens, options)
      : undefined),
    ...(state.pressed === true
      ? { opacity: tokens.pressedOpacity }
      : undefined),
    ...(state.focused === true ? focusStyle(tokens) : undefined),
  };
}

/**
 * Style of the selection frame a selectable control draws over its content.
 * The frame lies out of the flow, fills the padding box and keeps one border
 * width in every state, so selecting changes its colour and nothing that
 * sizes the control. Its corners follow the control's own, minus the
 * control's border.
 *
 * @param theme - Active native theme.
 * @param selected - `true` when the control shows its selected colour.
 * @param resting - The control's resting style, read for its corner radius and
 * border width.
 * @returns A frame style with `position: "absolute"`.
 * @example
 * selectedFrameStyle(theme, true).borderWidth; // 2
 */
function selectedFrameStyle(
  theme: NativeTheme,
  selected: boolean,
  resting: ViewStyle = {},
): ViewStyle {
  const { selectedBorder } = interactionTokens(theme);
  const radius =
    typeof resting.borderRadius === "number" ? resting.borderRadius : 0;
  const border =
    typeof resting.borderWidth === "number" ? resting.borderWidth : 0;
  return {
    borderColor: selected ? selectedBorder.color : "transparent",
    borderRadius: Math.max(0, radius - border),
    borderWidth: selectedBorder.width,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  };
}

export { interactionStyle, interactionTokens, selectedFrameStyle };
