"use client";

import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import {
  ControlGroupContext,
  useNestedControlGroup,
} from "../../../primitives/control-group";
import { useTheme } from "../../../theme/theme-provider";

/** Props for a visually related native button group. */
export type ButtonGroupProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly label: string;
  readonly orientation?: "horizontal" | "vertical";
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  horizontal: { alignItems: "stretch", flexDirection: "row" },
  vertical: { alignItems: "stretch", flexDirection: "column" },
});

/**
 * Groups native actions without changing the semantics of child buttons.
 * VoiceOver ignores labels on non-focusable containers, so package buttons
 * inside speak `label` as their hint.
 */
function ButtonGroup({
  children,
  label,
  orientation = "horizontal",
  ref,
  style,
  ...props
}: ButtonGroupProps) {
  const theme = useTheme();
  const group = useNestedControlGroup({ label });
  return (
    <ControlGroupContext value={group}>
      <View
        ref={ref}
        style={[
          orientation === "horizontal" ? styles.horizontal : styles.vertical,
          { gap: theme.spacing[1] },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </ControlGroupContext>
  );
}
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
