"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import {
  ControlGroupContext,
  useControlGroup,
  useNestedControlGroup,
} from "../../../primitives/control-group";
import { useTheme } from "../../../theme/theme-provider";
import { Text } from "../../atoms/text/text";

/** Layout axis for a native toolbar and its separators. */
export type ToolbarOrientation = "horizontal" | "vertical";

/** Props for a native group of related actions. */
export type ToolbarProps = ViewProps & {
  readonly orientation?: ToolbarOrientation;
  readonly ref?: Ref<View>;
};

/** Props for a toolbar action with a 44-point interaction target. */
export type ToolbarButtonProps = Omit<PressableProps, "children"> & {
  readonly children: ReactNode;
  readonly ref?: Ref<View>;
};

/** Props for a semantic toolbar divider. */
export type ToolbarSeparatorProps = ViewProps & {
  readonly orientation?: ToolbarOrientation;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  horizontal: { alignItems: "center", flexDirection: "row" },
  horizontalSeparator: { height: 24, width: 1 },
  vertical: { alignItems: "stretch", flexDirection: "column" },
  verticalSeparator: { height: 1, width: "100%" },
});

/**
 * Token-styled native toolbar that exposes toolbar group semantics. VoiceOver
 * ignores labels on non-focusable containers, so the toolbar's
 * `accessibilityLabel` becomes the hint of every ToolbarButton and package
 * Button inside.
 */
function Toolbar({
  accessibilityLabel,
  children,
  orientation = "horizontal",
  ref,
  style,
  ...props
}: ToolbarProps) {
  const theme = useTheme();
  const group = useNestedControlGroup({ label: accessibilityLabel });
  return (
    <View
      {...props}
      accessibilityRole="toolbar"
      ref={ref}
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          gap: theme.spacing[1],
          padding: theme.spacing[1],
        },
        style,
      ]}
    >
      <ControlGroupContext value={group}>{children}</ControlGroupContext>
    </View>
  );
}
Toolbar.displayName = "Toolbar";

/** Native toolbar action that preserves the minimum 44-point target. */
function ToolbarButton({
  accessibilityHint,
  accessibilityState,
  children,
  disabled: ownDisabled = false,
  ref,
  style,
  ...props
}: ToolbarButtonProps) {
  const theme = useTheme();
  const group = useControlGroup();
  const disabled = ownDisabled === true || group.disabled === true;
  return (
    <Pressable
      {...props}
      accessibilityHint={accessibilityHint ?? group.label}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled,
      }}
      disabled={disabled}
      ref={ref}
      style={(state) => [
        styles.action,
        {
          backgroundColor: state.pressed ? theme.colors.accent : "transparent",
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : 1,
          paddingHorizontal: theme.spacing[2],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text size="small">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
ToolbarButton.displayName = "ToolbarButton";

/** Semantic divider between native toolbar action groups. */
function ToolbarSeparator({
  orientation = "vertical",
  ref,
  style,
  ...props
}: ToolbarSeparatorProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessibilityRole="none"
      accessible={false}
      ref={ref}
      style={[
        orientation === "vertical"
          ? styles.horizontalSeparator
          : styles.verticalSeparator,
        { backgroundColor: theme.colors.border },
        style,
      ]}
    />
  );
}
ToolbarSeparator.displayName = "ToolbarSeparator";

export { Toolbar, ToolbarButton, ToolbarSeparator };
