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
import type { CalendarLabels } from "../calendar/calendar";
import {
  type DateRange,
  RangeCalendar,
} from "../range-calendar/range-calendar";

/** Localized labels and formatter for DateRangePicker. */
export type DateRangePickerLabels = CalendarLabels & {
  readonly close: string;
  readonly formatValue: (range: DateRange) => string;
  readonly open: string;
  readonly placeholder: string;
};
/** Props for a modal native date-range picker. */
export type DateRangePickerProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly labels: DateRangePickerLabels;
  readonly range: ControllableStateOptions<DateRange | undefined>;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  modal: { flex: 1, justifyContent: "flex-end" },
  panel: { borderTopWidth: 1 },
  trigger: { borderWidth: 1, justifyContent: "center", minHeight: 44 },
});

/** Date-range picker using an accessible native modal calendar. */
function DateRangePicker({
  disabled = false,
  labels,
  range: rangeState,
  ref,
  style,
  ...props
}: DateRangePickerProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [range, setRange] = useControllableState(rangeState);
  const [open, setOpen] = useState(false);
  return (
    <View ref={ref} style={style} {...props}>
      <Pressable
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityValue={{
          text: range ? labels.formatValue(range) : labels.placeholder,
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
              color: range
                ? theme.colors.foreground
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {range ? labels.formatValue(range) : labels.placeholder}
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
          <RangeCalendar
            disabled={disabled}
            labels={labels}
            range={{
              mode: "controlled",
              onChange: (next) => {
                if (!disabled) setRange(next);
              },
              value: range,
            }}
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
DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };
