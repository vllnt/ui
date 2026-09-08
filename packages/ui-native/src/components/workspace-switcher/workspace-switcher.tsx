"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { isSingleSelected } from "../../primitives/selection";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** One native workspace choice. */
export type WorkspaceOption = {
  readonly description?: string;
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
  readonly panel?: ReactNode;
};

/** Props for controlled or uncontrolled workspace selection. */
export type WorkspaceSwitcherProps = Omit<ViewProps, "children" | "ref"> & {
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly ref?: Ref<View>;
  readonly value?: string;
  readonly workspaces: readonly WorkspaceOption[];
};

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  list: { flexDirection: "row" },
});

/** Native workspace radio group that leaves navigation to the caller. */
function WorkspaceSwitcher({
  defaultValue,
  onValueChange,
  ref,
  style,
  value,
  workspaces,
  ...props
}: WorkspaceSwitcherProps) {
  const theme = useTheme();
  const stateOptions: ControllableStateOptions<string> =
    value === undefined
      ? {
          defaultValue: defaultValue ?? workspaces[0]?.id ?? "",
          mode: "uncontrolled",
          onChange: onValueChange,
        }
      : { mode: "controlled", onChange: onValueChange, value };
  const [selectedValue, setSelectedValue] = useControllableState(stateOptions);
  const selected = workspaces.find((workspace) =>
    isSingleSelected(selectedValue, workspace, (candidate) => candidate.id),
  );

  return (
    <View {...props} ref={ref} style={style}>
      <ScrollView
        accessibilityRole="radiogroup"
        contentContainerStyle={[
          styles.list,
          {
            backgroundColor: theme.colors.muted,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.full,
            borderWidth: 1,
            gap: theme.spacing[1],
            padding: theme.spacing[1],
          },
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {workspaces.map((workspace) => {
          const active = isSingleSelected(
            selectedValue,
            workspace,
            (candidate) => candidate.id,
          );
          return (
            <Pressable
              accessibilityHint={workspace.description}
              accessibilityLabel={workspace.label}
              accessibilityRole="radio"
              accessibilityState={{
                checked: active,
                disabled: workspace.disabled,
                selected: active,
              }}
              disabled={workspace.disabled}
              key={workspace.id}
              onPress={() => {
                setSelectedValue(workspace.id);
              }}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: active
                    ? theme.colors.background
                    : pressed
                      ? theme.colors.accent
                      : "transparent",
                  borderRadius: theme.radius.full,
                  opacity: workspace.disabled ? 0.5 : pressed ? 0.8 : 1,
                  paddingHorizontal: theme.spacing[3],
                },
              ]}
            >
              <Text
                size="small"
                tone={active ? "default" : "muted"}
                weight="medium"
              >
                {workspace.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {selected?.description ? (
        <Text size="caption" tone="muted">
          {selected.description}
        </Text>
      ) : null}
      {selected?.panel}
    </View>
  );
}
WorkspaceSwitcher.displayName = "WorkspaceSwitcher";

export { WorkspaceSwitcher };
