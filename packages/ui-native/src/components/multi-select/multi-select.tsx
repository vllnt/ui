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
import { toggleMultipleSelected } from "../../primitives/selection";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";
import { Input } from "../input/input";
import type { SelectOption } from "../select/select";

/** Search metadata for a multi-select option. */
export type MultiSelectOption = SelectOption & {
  readonly keywords?: readonly string[];
};

/** Localized labels required by MultiSelect. */
export type MultiSelectLabels = {
  readonly close: string;
  readonly empty: string;
  readonly open: string;
  readonly options: string;
  readonly placeholder: string;
  readonly search: string;
};

/** Props for the native modal multi-select. */
export type MultiSelectProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly labels: MultiSelectLabels;
  readonly options: readonly MultiSelectOption[];
  readonly ref?: Ref<View>;
  readonly searchable?: boolean;
  readonly selection: ControllableStateOptions<ReadonlySet<string>>;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: { justifyContent: "center", minHeight: 44 },
  panel: { borderTopWidth: 1, maxHeight: "80%" },
  trigger: { borderWidth: 1, justifyContent: "center", minHeight: 44 },
});

/** Native multi-select with optional real text filtering and modal options. */
function MultiSelect({
  disabled = false,
  labels,
  options,
  ref,
  searchable = false,
  selection,
  style,
  ...props
}: MultiSelectProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [selectedIds, setSelectedIds] = useControllableState(selection);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const getId = useMemo(() => (option: MultiSelectOption) => option.id, []);
  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => selectedIds.has(option.id))
        .map((option) => option.label),
    [options, selectedIds],
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
          numberOfLines={1}
          style={[
            theme.typography.scale.bodySmall,
            {
              color:
                selectedLabels.length > 0
                  ? theme.colors.foreground
                  : theme.colors.mutedForeground,
            },
          ]}
        >
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : labels.placeholder}
        </NativeText>
      </Pressable>
      <ModalLayer
        animationType={reducedMotion ? "none" : "fade"}
        contentProps={{
          accessibilityLabel: labels.options,
          style: styles.modal,
        }}
        onClose={() => {
          setOpen(false);
          setQuery("");
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
          {searchable ? (
            <Input
              accessibilityLabel={labels.search}
              inputMode="search"
              onChangeText={setQuery}
              placeholder={labels.search}
              returnKeyType="search"
              style={{ minHeight: 44 }}
              value={query}
            />
          ) : null}
          <ScrollView
            accessibilityLabel={labels.options}
            keyboardShouldPersistTaps="handled"
          >
            {visibleOptions.map((option) => {
              const selected = selectedIds.has(option.id);
              return (
                <Pressable
                  accessibilityLabel={option.label}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: selected,
                    disabled: option.disabled,
                  }}
                  disabled={option.disabled}
                  key={option.id}
                  onPress={() => {
                    setSelectedIds(
                      toggleMultipleSelected(selectedIds, option, getId),
                    );
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
                    {selected ? "✓ " : ""}
                    {option.label}
                  </NativeText>
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
              setOpen(false);
              setQuery("");
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
MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
