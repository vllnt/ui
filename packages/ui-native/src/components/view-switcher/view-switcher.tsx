"use client";

import { useId } from "react";

import type { ReactNode, Ref } from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";

import { isSingleSelected } from "../../primitives/selection";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** One selectable native view. */
export type ViewOption = {
  readonly disabled?: boolean;
  readonly key: string;
  readonly label: string;
  readonly panel?: ReactNode;
};

/** Props for a caller-owned native view switcher. */
export type ViewSwitcherProps = Omit<ViewProps, "children" | "ref"> & {
  readonly defaultValue?: string;
  readonly id?: string;
  readonly onValueChange?: (value: string) => void;
  readonly options: readonly ViewOption[];
  readonly ref?: Ref<View>;
  readonly value?: string;
};

const styles = StyleSheet.create({
  list: { flexDirection: "row" },
  trigger: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

/** Segmented native tabs that report selection without owning routing. */
function ViewSwitcher({
  defaultValue,
  id,
  onValueChange,
  options,
  ref,
  style,
  value,
  ...props
}: ViewSwitcherProps) {
  const theme = useTheme();
  const generatedId = useId();
  const stateOptions: ControllableStateOptions<string> =
    value === undefined
      ? {
          defaultValue: defaultValue ?? options[0]?.key ?? "",
          mode: "uncontrolled",
          onChange: onValueChange,
        }
      : { mode: "controlled", onChange: onValueChange, value };
  const [selectedValue, setSelectedValue] = useControllableState(stateOptions);
  const selected = options.find((option) =>
    isSingleSelected(selectedValue, option, (candidate) => candidate.key),
  );
  const baseId = id ?? generatedId;

  return (
    <View {...props} ref={ref} style={style}>
      <View
        accessibilityRole="tablist"
        style={[
          styles.list,
          {
            backgroundColor: theme.colors.muted,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            gap: theme.spacing[1],
            padding: theme.spacing[1],
          },
        ]}
      >
        {options.map((option) => {
          const active = isSingleSelected(
            selectedValue,
            option,
            (candidate) => candidate.key,
          );
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{
                disabled: option.disabled,
                selected: active,
              }}
              aria-controls={
                active && option.panel !== undefined
                  ? `${baseId}-panel-${option.key}`
                  : undefined
              }
              disabled={option.disabled}
              id={`${baseId}-tab-${option.key}`}
              key={option.key}
              onPress={() => {
                setSelectedValue(option.key);
              }}
              style={({ pressed }) => [
                styles.trigger,
                {
                  backgroundColor: active
                    ? theme.colors.background
                    : pressed
                      ? theme.colors.accent
                      : "transparent",
                  borderRadius: theme.radius.md,
                  flex: 1,
                  opacity: option.disabled ? 0.5 : pressed ? 0.8 : 1,
                  paddingHorizontal: theme.spacing[3],
                },
              ]}
            >
              <Text
                size="small"
                tone={active ? "default" : "muted"}
                weight="medium"
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {selected?.panel === undefined ? null : (
        <View
          aria-labelledby={`${baseId}-tab-${selected.key}`}
          id={`${baseId}-panel-${selected.key}`}
          style={{ paddingTop: theme.spacing[4] }}
        >
          {selected.panel}
        </View>
      )}
    </View>
  );
}
ViewSwitcher.displayName = "ViewSwitcher";

export { ViewSwitcher };
