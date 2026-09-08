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
  readonly disabled?: boolean;
  readonly errorText?: string;
  readonly invalid?: boolean;
  readonly labels: SelectLabels;
  readonly onOpenChange?: (open: boolean) => void;
  readonly options: readonly SelectOption[];
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<string | undefined>;
};

const styles = StyleSheet.create({
  close: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  error: { marginTop: 4 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  panel: { borderTopWidth: 1, maxHeight: "75%" },
  trigger: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
    width: "100%",
  },
});

/** Accessible native picker that presents options in a modal list. */
function Select({
  disabled = false,
  errorText,
  invalid = false,
  labels,
  onOpenChange,
  options,
  ref,
  selection,
  style,
  ...props
}: SelectProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useControllableState(selection);
  const [open, setOpen] = useState(false);
  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedId),
    [options, selectedId],
  );
  const setModalOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <View ref={ref} style={style} {...props}>
      <Pressable
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        aria-invalid={invalid}
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
            opacity: disabled ? 0.5 : 1,
            paddingHorizontal: theme.spacing[3],
          },
        ]}
      >
        <NativeText
          numberOfLines={1}
          style={[
            theme.typography.scale.bodySmall,
            {
              color: selectedOption
                ? theme.colors.foreground
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {selectedOption?.label ?? labels.placeholder}
        </NativeText>
        <NativeText style={{ color: theme.colors.mutedForeground }}>
          ⌄
        </NativeText>
      </Pressable>
      {invalid && errorText ? (
        <NativeText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            styles.error,
            theme.typography.scale.bodySmall,
            { color: theme.colors.destructive },
          ]}
        >
          {errorText}
        </NativeText>
      ) : null}
      <ModalLayer
        animationType={reducedMotion ? "none" : "fade"}
        contentProps={{
          accessibilityLabel: labels.options,
          style: styles.modal,
        }}
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
          <ScrollView accessibilityLabel={labels.options}>
            {options.map((option) => {
              const selected = option.id === selectedId;
              const optionDisabled = disabled || option.disabled === true;
              return (
                <Pressable
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
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected
                        ? theme.colors.accent
                        : theme.colors.background,
                      borderRadius: theme.radius.sm,
                      opacity: optionDisabled ? 0.5 : 1,
                      paddingHorizontal: theme.spacing[3],
                    },
                  ]}
                >
                  <NativeText
                    style={[
                      theme.typography.scale.bodySmall,
                      { color: theme.colors.foreground },
                    ]}
                  >
                    {option.label}
                  </NativeText>
                  {selected ? (
                    <NativeText style={{ color: theme.colors.foreground }}>
                      ✓
                    </NativeText>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            accessibilityLabel={labels.close}
            accessibilityRole="button"
            onPress={() => {
              setModalOpen(false);
            }}
            style={styles.close}
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
Select.displayName = "Select";

export { Select };
