"use client";

import { type ReactNode, type Ref, useState } from "react";

import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../theme/theme-provider";

import { targetFloorStyle } from "./control-size";
import { type InteractionState, interactionStyle } from "./interaction-state";

/** Props for {@link InteractivePressable}. */
export type InteractivePressableProps = Omit<
  PressableProps,
  "children" | "style"
> & {
  /** Content, or a function of the full interaction state. */
  readonly children?: ((state: InteractionState) => ReactNode) | ReactNode;
  /** The control paints its own fill, so hover dims it instead of tinting. */
  readonly filled?: boolean;
  readonly ref?: Ref<View>;
  /** Marks the control selected, which adds the non-colour border cue. */
  readonly selected?: boolean;
  /** Resting style; interaction states layer on top of it. */
  readonly style?:
    | ((state: InteractionState) => StyleProp<ViewStyle>)
    | StyleProp<ViewStyle>;
};

/**
 * The one pressable of the affordance contract (#633). It wraps React Native's
 * Pressable, tracks hover and focus beside press, and layers the shared state
 * styles (pressed, hovered, focused, selected, disabled) and the touch-target
 * floor over the caller's resting style. Caller handlers still run.
 *
 * React Native has no `:focus-visible`, so any focus shows the ring. The
 * states change style instantly; this primitive adds no transition, so it
 * needs no reduced-motion branch.
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
  selected = false,
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
    selected,
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
          typeof style === "function" ? style(state) : style,
          interactionStyle(theme, state, { filled }),
        ];
      }}
    >
      {typeof children === "function"
        ? ({ pressed }) => children(stateOf(pressed))
        : children}
    </Pressable>
  );
}
InteractivePressable.displayName = "InteractivePressable";

export { InteractivePressable };
