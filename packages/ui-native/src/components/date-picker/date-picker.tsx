"use client";

import { type Ref, useState } from "react";

import {
  Pressable,
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
import { Calendar, type CalendarLabels } from "../calendar/calendar";

/** Localized labels and formatter for DatePicker. */
export type DatePickerLabels = CalendarLabels & {
  readonly close: string;
  readonly formatValue: (date: Date) => string;
  readonly open: string;
  readonly placeholder: string;
};
/** Props for a modal native Date picker. */
export type DatePickerProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly labels: DatePickerLabels;
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<Date | undefined>;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  modal: { flex: 1, justifyContent: "flex-end" },
  panel: { borderTopWidth: 1 },
  trigger: { borderWidth: 1, justifyContent: "center", minHeight: 44 },
});

/** Date picker using a native modal calendar rather than a DOM popover. */
function DatePicker({
  disabled = false,
  labels,
  ref,
  selection,
  style,
  ...props
}: DatePickerProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [date, setDate] = useControllableState(selection);
  const [open, setOpen] = useState(false);
  const choose = (next?: Date) => {
    if (disabled) return;
    setDate(next);
    if (next) setOpen(false);
  };
  return (
    <View ref={ref} style={style} {...props}>
      <Pressable
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityValue={{
          text: date ? labels.formatValue(date) : labels.placeholder,
        }}
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
              color: date
                ? theme.colors.foreground
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {date ? labels.formatValue(date) : labels.placeholder}
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
          <Calendar
            disabled={disabled}
            labels={labels}
            selection={{ mode: "controlled", onChange: choose, value: date }}
          />
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
DatePicker.displayName = "DatePicker";

export { DatePicker };
