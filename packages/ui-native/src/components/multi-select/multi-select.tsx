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

import { useAnnounceOnChange } from "../../primitives/accessibility";
import { ModalLayer } from "../../primitives/modal-layer";
import { toggleMultipleSelected } from "../../primitives/selection";
import { typeStyle } from "../../primitives/type-style";
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
  /** Result count spoken after filtering, for example "3 options". */
  readonly results?: (count: number) => string;
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
  heading: { marginBottom: 8 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: { justifyContent: "center", minHeight: 44 },
  panel: { borderTopWidth: 1, maxHeight: "80%" },
  trigger: { borderWidth: 1, justifyContent: "center", minHeight: 44 },
});

/**
 * Native multi-select with optional real text filtering and modal options. The
 * trigger speaks the selected options (or placeholder) as its value, and the
 * filtered result count or empty message is announced while searching.
 */
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
  const noResults = visibleOptions.length === 0;
  useAnnounceOnChange(
    query.trim()
      ? noResults
        ? labels.empty
        : labels.results?.(visibleOptions.length)
      : undefined,
    { liveRegion: noResults },
  );

  return (
    <View ref={ref} style={style} {...props}>
      <Pressable
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityValue={{
          text:
            selectedLabels.length > 0
              ? selectedLabels.join(", ")
              : labels.placeholder,
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
          numberOfLines={1}
          style={typeStyle(
            theme,
            "bodySmall",
            selectedLabels.length > 0 ? "foreground" : "mutedForeground",
          )}
        >
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : labels.placeholder}
        </NativeText>
      </Pressable>
      <ModalLayer
        animationType={reducedMotion ? "none" : "fade"}
        contentProps={{ style: styles.modal }}
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
          <ScrollView keyboardShouldPersistTaps="handled">
            {visibleOptions.map((option) => {
              const selected = selectedIds.has(option.id);
              return (
                <Pressable
                  accessibilityLabel={option.label}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: selected,
                    disabled: disabled || option.disabled,
                  }}
                  disabled={disabled || option.disabled}
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
                      opacity: disabled || option.disabled ? 0.5 : 1,
                      paddingHorizontal: theme.spacing[3],
                    },
                  ]}
                >
                  <NativeText
                    style={typeStyle(theme, "bodySmall", "foreground")}
                  >
                    {selected ? "✓ " : ""}
                    {option.label}
                  </NativeText>
                </Pressable>
              );
            })}
            {noResults ? (
              <NativeText
                accessibilityLiveRegion="polite"
                style={typeStyle(theme, "bodySmall", {
                  color: "mutedForeground",
                  padding: theme.spacing[3],
                })}
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
            <NativeText style={typeStyle(theme, "bodySmall", "foreground")}>
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
