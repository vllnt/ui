import type { ReactNode, Ref } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type View,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Screen corner used by FloatingActionButton. */
export type FloatingActionButtonPosition = "bottom-left" | "bottom-right";

/** Props for a native floating action button. */
export type FloatingActionButtonProps = Omit<
  PressableProps,
  "accessibilityLabel" | "children"
> & {
  readonly accessibilityLabel: string;
  readonly children: ReactNode;
  readonly position?: FloatingActionButtonPosition;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
});

/** Native primary floating action without decorative scaling animation. */
function FloatingActionButton({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled = false,
  position = "bottom-right",
  ref,
  style,
  ...props
}: FloatingActionButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled === true;

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      ref={ref}
      style={(state) => [
        styles.base,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.full,
          bottom: theme.spacing[4],
          height: theme.spacing[12],
          left: position === "bottom-left" ? theme.spacing[4] : undefined,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.8 : 1,
          right: position === "bottom-right" ? theme.spacing[4] : undefined,
          width: theme.spacing[12],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}
FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton };
