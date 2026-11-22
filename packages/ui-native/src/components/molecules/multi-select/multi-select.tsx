"use client";

import { type Ref, useCallback, useMemo, useState } from "react";

import {
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useAnnounceOnChange } from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { ModalLayer } from "../../../primitives/modal-layer";
import { screenReaderListProps } from "../../../primitives/screen-reader-list";
import { toggleMultipleSelected } from "../../../primitives/selection";
import { typeStyle } from "../../../primitives/type-style";
import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";
import { useControllableState } from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";
import { Input } from "../../atoms/input/input";
import type { SelectOption } from "../../atoms/select/select";

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
  action: { alignItems: "center", justifyContent: "center" },
  heading: { marginBottom: 8 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: { justifyContent: "center" },
  panel: { borderTopWidth: 1, maxHeight: "80%" },
  trigger: { borderWidth: 1, justifyContent: "center" },
});

type MultiSelectOptionRowProps = {
  readonly disabled: boolean | undefined;
  readonly onToggle: (option: MultiSelectOption) => void;
  readonly option: MultiSelectOption;
  readonly selected: boolean;
};

function MultiSelectOptionRow({
  disabled,
  onToggle,
  option,
  selected,
}: MultiSelectOptionRowProps) {
  const theme = useTheme();
  return (
    <InteractivePressable
      accessibilityLabel={option.label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => {
        onToggle(option);
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
      <NativeText style={typeStyle(theme, "bodySmall", "foreground")}>
        {selected ? "✓ " : ""}
        {option.label}
      </NativeText>
    </InteractivePressable>
  );
}
MultiSelectOptionRow.displayName = "MultiSelectOptionRow";

/**
 * Native multi-select with optional real text filtering and modal options. The
 * trigger speaks the selected options (or placeholder) as its value, and the
 * filtered result count or empty message is announced while searching.
 */
function MultiSelect({
  disabled: ownDisabled = false,
  labels,
  options,
  ref,
  searchable = false,
  selection,
  style,
  ...props
}: MultiSelectProps) {
  const disabled = useGroupDisabled(ownDisabled);
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
  const toggleOption = useCallback(
    (option: MultiSelectOption) => {
      setSelectedIds(toggleMultipleSelected(selectedIds, option, getId));
    },
    [getId, selectedIds, setSelectedIds],
  );
  const renderOption = useCallback(
    ({ item }: ListRenderItemInfo<MultiSelectOption>) => (
      <MultiSelectOptionRow
        disabled={disabled || item.disabled}
        onToggle={toggleOption}
        option={item}
        selected={selectedIds.has(item.id)}
      />
    ),
    [disabled, selectedIds, toggleOption],
  );
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
      <InteractivePressable
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
      </InteractivePressable>
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
          <FlatList
            {...screenReaderListProps(visibleOptions.length)}
            data={visibleOptions}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(option) => option.id}
            ListEmptyComponent={
              <NativeText
                accessibilityLiveRegion="polite"
                style={typeStyle(theme, "bodySmall", {
                  color: "mutedForeground",
                  padding: theme.spacing[3],
                })}
              >
                {labels.empty}
              </NativeText>
            }
            renderItem={renderOption}
          />
          <InteractivePressable
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
          </InteractivePressable>
        </View>
      </ModalLayer>
    </View>
  );
}
MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
