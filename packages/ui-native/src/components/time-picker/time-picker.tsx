"use client";

import { type Ref, useMemo, useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { ModalLayer } from "../../primitives/modal-layer";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";
import type { ISOTimeString } from "../time-field/time-field";

/** Localized labels for the native modal time picker. */
export type TimePickerLabels = {
  readonly close: string;
  readonly hour: string;
  readonly minute: string;
  readonly open: string;
  readonly placeholder: string;
};
/** Props for a native hour-and-minute modal list picker. */
export type TimePickerProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly labels: TimePickerLabels;
  readonly minuteStep?: number;
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<ISOTimeString | undefined>;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  columns: { flexDirection: "row", maxHeight: 360 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  panel: { borderTopWidth: 1 },
  trigger: { borderWidth: 1, justifyContent: "center", minHeight: 44 },
});

function part(value: number): string {
  return value.toString().padStart(2, "0");
}
function validTime(value: string): value is ISOTimeString {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** Native modal time picker with explicit hour and minute options. */
function TimePicker({
  disabled = false,
  labels,
  minuteStep = 5,
  ref,
  selection,
  style,
  ...props
}: TimePickerProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useControllableState(selection);
  const [open, setOpen] = useState(false);
  const selectedTime = value && validTime(value) ? value : undefined;
  const [hour, minute] = selectedTime?.split(":") ?? ["", ""];
  const hours = useMemo(
    () => Array.from({ length: 24 }, (_unused, index) => part(index)),
    [],
  );
  const safeStep = Number.isFinite(minuteStep)
    ? Math.max(1, Math.min(60, Math.floor(minuteStep)))
    : 5;
  const minutes = useMemo(
    () =>
      Array.from({ length: Math.ceil(60 / safeStep) }, (_unused, index) =>
        part(index * safeStep),
      ),
    [safeStep],
  );
  const commit = (nextHour: string, nextMinute: string) => {
    if (disabled) return;
    const next = `${nextHour || "00"}:${nextMinute || "00"}`;
    if (validTime(next)) setValue(next);
  };
  const column = (
    label: string,
    options: readonly string[],
    selected: string,
    choose: (item: string) => void,
  ) => (
    <ScrollView accessibilityLabel={label} style={{ flex: 1 }}>
      {options.map((option) => (
        <Pressable
          accessibilityLabel={option}
          accessibilityRole="radio"
          accessibilityState={{ checked: option === selected, disabled }}
          disabled={disabled}
          key={option}
          onPress={() => {
            choose(option);
          }}
          style={[
            styles.option,
            {
              backgroundColor:
                option === selected
                  ? theme.colors.accent
                  : theme.colors.background,
            },
          ]}
        >
          <NativeText
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.foreground },
            ]}
          >
            {option}
          </NativeText>
        </Pressable>
      ))}
    </ScrollView>
  );
  return (
    <View ref={ref} style={style} {...props}>
      <Pressable
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => {
          setOpen(true);
        }}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.input,
            borderRadius: theme.radius.md,
            opacity: disabled ? 0.5 : 1,
            paddingHorizontal: theme.spacing[3],
          },
        ]}
      >
        <NativeText
          style={[
            theme.typography.scale.bodySmall,
            {
              color: selectedTime
                ? theme.colors.foreground
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {selectedTime ?? labels.placeholder}
        </NativeText>
      </Pressable>
      <ModalLayer
        animationType={reducedMotion ? "none" : "fade"}
        contentProps={{ style: styles.modal }}
        onClose={() => {
          setOpen(false);
        }}
        visible={open}
      >
        <View
          style={[
            styles.panel,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              padding: theme.spacing[4],
            },
          ]}
        >
          <View style={styles.columns}>
            {column(labels.hour, hours, hour ?? "", (next) => {
              commit(next, minute ?? "");
            })}
            {column(labels.minute, minutes, minute ?? "", (next) => {
              commit(hour ?? "", next);
            })}
          </View>
          <Pressable
            accessibilityLabel={labels.close}
            accessibilityRole="button"
            onPress={() => {
              setOpen(false);
            }}
            style={styles.action}
          >
            <NativeText
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {labels.close}
            </NativeText>
          </Pressable>
        </View>
      </ModalLayer>
    </View>
  );
}
TimePicker.displayName = "TimePicker";

export { TimePicker };
