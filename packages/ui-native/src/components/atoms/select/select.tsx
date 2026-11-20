"use client";

import { type Ref, useMemo } from "react";

import {
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  decorativeProps,
  requiredHint,
  useAnnounceOnChange,
} from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { ModalLayer } from "../../../primitives/modal-layer";
import { typeStyle } from "../../../primitives/type-style";
import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

/** Caller-identified option rendered by native selection controls. */
export type SelectOption = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
};

/** Localized labels used by the native modal selection model. */
export type SelectLabels = {
  readonly close: string;
  readonly open: string;
  readonly options: string;
  readonly placeholder: string;
};

/** Props for a native single-select modal list. */
export type SelectProps = Omit<ViewProps, "children"> & {
  /** Starts with the option list open. Ignored when `open` is passed. */
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly errorText?: string;
  readonly invalid?: boolean;
  readonly labels: SelectLabels;
  readonly onOpenChange?: (open: boolean) => void;
  /** Controls whether the option list is open. */
  readonly open?: boolean;
  readonly options: readonly SelectOption[];
  readonly ref?: Ref<View>;
  /**
   * Speaks "required" with the trigger's hint. React Native has no `required`
   * accessibility state, and nothing is validated for you: pass `invalid`
   * and `errorText` once the user leaves it empty.
   */
  readonly required?: boolean;
  /** The spoken word for `required`; defaults to English "Required". */
  readonly requiredLabel?: string;
  readonly selection: ControllableStateOptions<string | undefined>;
};

const styles = StyleSheet.create({
  close: { alignItems: "center", justifyContent: "center" },
  error: { marginTop: 4 },
  heading: { marginBottom: 8 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panel: { borderTopWidth: 1, maxHeight: "75%" },
  trigger: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

/**
 * Accessible native picker that presents options in a modal list. The trigger
 * speaks `labels.open` as its name and the selected option (or placeholder) as
 * its value; the open list is titled by a `labels.options` header.
 */
function Select({
  defaultOpen = false,
  disabled: ownDisabled = false,
  errorText,
  invalid = false,
  labels,
  onOpenChange,
  open: openProperty,
  options,
  ref,
  required = false,
  requiredLabel = "Required",
  selection,
  style,
  ...props
}: SelectProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useControllableState(selection);
  const [open, setModalOpen] = useControllableState(
    controllableOptions(openProperty, defaultOpen, onOpenChange),
  );
  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedId),
    [options, selectedId],
  );
  const error = invalid ? errorText : undefined;
  useAnnounceOnChange(error, { liveRegion: true });

  return (
    <View ref={ref} style={style} {...props}>
      <InteractivePressable
        accessibilityHint={requiredHint(error, required, requiredLabel)}
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityValue={{
          text: selectedOption?.label ?? labels.placeholder,
        }}
        disabled={disabled}
        onPress={() => {
          setModalOpen(true);
        }}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.colors.background,
            borderColor: invalid
              ? theme.colors.destructive
              : theme.colors.input,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing[3],
          },
        ]}
      >
        <NativeText
          numberOfLines={1}
          style={typeStyle(
            theme,
            "bodySmall",
            selectedOption ? "foreground" : "mutedForeground",
          )}
        >
          {selectedOption?.label ?? labels.placeholder}
        </NativeText>
        <NativeText
          {...decorativeProps}
          style={{ color: theme.colors.mutedForeground }}
        >
          ⌄
        </NativeText>
      </InteractivePressable>
      {error ? (
        <NativeText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            styles.error,
            ...typeStyle(theme, "bodySmall", "destructive"),
          ]}
        >
          {errorText}
        </NativeText>
      ) : null}
      <ModalLayer
        animationType={reducedMotion ? "none" : "fade"}
        contentProps={{ style: styles.modal }}
        onClose={() => {
          setModalOpen(false);
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
          <NativeText
            accessibilityRole="header"
            style={[
              styles.heading,
              ...typeStyle(theme, "bodySmall", {
                color: "foreground",
                fontWeight: theme.typography.fontWeight.heading,
              }),
            ]}
          >
            {labels.options}
          </NativeText>
          <ScrollView>
            {options.map((option) => {
              const selected = option.id === selectedId;
              const optionDisabled = disabled || option.disabled === true;
              return (
                <InteractivePressable
                  accessibilityLabel={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selected,
                    disabled: optionDisabled,
                  }}
                  disabled={optionDisabled}
                  key={option.id}
                  onPress={() => {
                    setSelectedId(option.id);
                    setModalOpen(false);
                  }}
                  selected={selected}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected
                        ? theme.colors.accent
                        : theme.colors.background,
                      borderRadius: theme.radius.sm,
                      paddingHorizontal: theme.spacing[3],
                    },
                  ]}
                >
                  <NativeText
                    style={typeStyle(theme, "bodySmall", "foreground")}
                  >
                    {option.label}
                  </NativeText>
                  {selected ? (
                    <NativeText style={{ color: theme.colors.foreground }}>
                      ✓
                    </NativeText>
                  ) : null}
                </InteractivePressable>
              );
            })}
          </ScrollView>
          <InteractivePressable
            accessibilityLabel={labels.close}
            accessibilityRole="button"
            onPress={() => {
              setModalOpen(false);
            }}
            style={styles.close}
          >
            <NativeText style={typeStyle(theme, "bodySmall", "foreground")}>
              {labels.close}
            </NativeText>
          </InteractivePressable>
        </View>
      </ModalLayer>
    </View>
  );
}
Select.displayName = "Select";

export { Select };
