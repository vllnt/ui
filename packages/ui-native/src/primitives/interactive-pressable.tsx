"use client";

import { type ReactNode, type Ref, useState } from "react";

import {
  type NativeSyntheticEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../theme/theme-provider";

import { decorativeProps } from "./accessibility";
import { targetFloorStyle } from "./control-size";
import {
  type InteractionState,
  interactionStyle,
  selectedFrameStyle,
} from "./interaction-state";

/**
 * Key press from a hardware keyboard or D-pad. `key` follows
 * `KeyboardEvent.key` (`"ArrowRight"`, `"Home"`, ...). React Native's public
 * typings omit `onKeyDown` on views although the runtime delivers it.
 */
export type KeyDownEvent = NativeSyntheticEvent<{ readonly key: string }>;

/** Props for {@link InteractivePressable}. */
export type InteractivePressableProps = Omit<
  PressableProps,
  "children" | "style"
> & {
  /** Content, or a function of the full interaction state. */
  readonly children?: ((state: InteractionState) => ReactNode) | ReactNode;
  /** The control paints its own fill, so hover dims it instead of tinting. */
  readonly filled?: boolean;
  /** Runs when a key goes down while the control has focus. */
  readonly onKeyDown?: (event: KeyDownEvent) => void;
  readonly ref?: Ref<View>;
  /**
   * Marks a selectable control. Any boolean draws the selection frame, which
   * is transparent until `true`, so selecting never changes the control's
   * size. Leave it undefined for a control that is never selectable.
   */
  readonly selected?: boolean;
  /** Resting style; interaction states layer on top of it. */
  readonly style?:
    | ((state: InteractionState) => StyleProp<ViewStyle>)
    | StyleProp<ViewStyle>;
};

function restingStyleOf(
  style: InteractivePressableProps["style"],
  state: InteractionState,
): StyleProp<ViewStyle> {
  return typeof style === "function" ? style(state) : style;
}

type SelectionFrameProps = {
  readonly state: InteractionState;
  readonly style: InteractivePressableProps["style"];
};

/** Decorative border frame that sits inside a selectable control's box. */
function SelectionFrame({ state, style }: SelectionFrameProps): ReactNode {
  const theme = useTheme();
  const resting = StyleSheet.flatten(restingStyleOf(style, state));
  return (
    <View
      {...decorativeProps}
      pointerEvents="none"
      style={selectedFrameStyle(theme, state.selected, resting)}
    />
  );
}

/**
 * The one pressable of the affordance contract (#633). It wraps React Native's
 * Pressable, tracks hover and focus beside press, and layers the shared state
 * styles (pressed, hovered, focused, disabled) and the touch-target floor over
 * the caller's resting style. A selectable control also draws a selection
 * frame inside its box. Caller handlers still run.
 *
 * No state changes the control's size: state styles never touch width, height,
 * padding or border, the focus ring is an outline, and the selection frame
 * lies out of the flow. React Native has no `:focus-visible`, so any focus
 * shows the ring. States change style instantly; this primitive adds no
 * transition, so it needs no reduced-motion branch.
 *
 * @param props - Pressable props plus `selected`, `filled` and function
 * children or style that receive the full interaction state.
 * @returns A pressable host that exposes every interaction state visually.
 * @example
 * <InteractivePressable accessibilityRole="button" accessibilityLabel="Save">
 *   <Text>Save</Text>
 * </InteractivePressable>
 */
function InteractivePressable({
  children,
  disabled,
  filled = false,
  onBlur,
  onFocus,
  onHoverIn,
  onHoverOut,
  ref,
  selected,
  style,
  ...props
}: InteractivePressableProps): ReactNode {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const stateOf = (pressed: boolean): InteractionState => ({
    disabled: disabled === true,
    focused,
    hovered,
    pressed,
    selected: selected === true,
  });

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      ref={ref}
      style={({ pressed }) => {
        const state = stateOf(pressed);
        return [
          targetFloorStyle(theme),
          restingStyleOf(style, state),
          interactionStyle(theme, state, { filled }),
        ];
      }}
    >
      {({ pressed }) => {
        const state = stateOf(pressed);
        return (
          <>
            {typeof children === "function" ? children(state) : children}
            {selected === undefined ? null : (
              <SelectionFrame state={state} style={style} />
            )}
          </>
        );
      }}
    </Pressable>
  );
}
InteractivePressable.displayName = "InteractivePressable";

export { InteractivePressable };
