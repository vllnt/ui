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
import { Input } from "../input/input";
import type { SelectOption } from "../select/select";

/** Search metadata for a caller-identified combobox option. */
export type ComboboxOption = SelectOption & {
  readonly keywords?: readonly string[];
};

/** Localized labels required by the native searchable picker. */
export type ComboboxLabels = {
  readonly close: string;
  readonly empty: string;
  readonly open: string;
  readonly options: string;
  readonly placeholder: string;
  readonly search: string;
};

/** Props for a modal native combobox with real local filtering. */
export type ComboboxProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly labels: ComboboxLabels;
  readonly onOpenChange?: (open: boolean) => void;
  readonly options: readonly ComboboxOption[];
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<string | undefined>;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  panel: { borderTopWidth: 1, maxHeight: "80%" },
  search: { marginBottom: 8 },
  trigger: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
});

/** Searchable native picker presented as a keyboard-aware modal list. */
function Combobox({
  disabled = false,
  labels,
  onOpenChange,
  options,
  ref,
  selection,
  style,
  ...props
}: ComboboxProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useControllableState(selection);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedId),
    [options, selectedId],
  );
  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      [option.label, ...(option.keywords ?? [])]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [options, query]);
  const setModalOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
    onOpenChange?.(nextOpen);
  };

  return (
    <View ref={ref} style={style} {...props}>
      <Pressable
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => {
          setModalOpen(true);
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
          <Input
            accessibilityLabel={labels.search}
            autoFocus
            inputMode="search"
            onChangeText={setQuery}
            placeholder={labels.search}
            returnKeyType="search"
            style={[styles.search, { minHeight: 44 }]}
            value={query}
          />
          <ScrollView
            accessibilityLabel={labels.options}
            keyboardShouldPersistTaps="handled"
          >
            {visibleOptions.map((option) => {
              const selected = option.id === selectedId;
              return (
                <Pressable
                  accessibilityLabel={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selected,
                    disabled: option.disabled,
                  }}
                  disabled={option.disabled}
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
                      opacity: option.disabled ? 0.5 : 1,
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
            {visibleOptions.length === 0 ? (
              <NativeText
                accessibilityLiveRegion="polite"
                style={[
                  theme.typography.scale.bodySmall,
                  {
                    color: theme.colors.mutedForeground,
                    padding: theme.spacing[3],
                  },
                ]}
              >
                {labels.empty}
              </NativeText>
            ) : null}
          </ScrollView>
          <Pressable
            accessibilityLabel={labels.close}
            accessibilityRole="button"
            onPress={() => {
              setModalOpen(false);
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
Combobox.displayName = "Combobox";

export { Combobox };
