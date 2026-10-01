"use client";

import { type Ref, useId } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewProps,
} from "react-native";

import { typeStyle } from "../../primitives/type-style";
import { useTheme } from "../../theme/theme-provider";

/** Localized labels for native tutorial filters. */
export type TutorialFiltersLabels = {
  readonly activeFilters: string;
  readonly clear: string;
  readonly clearAll: string;
  readonly difficulty: Readonly<Record<string, string>>;
  readonly difficultyLabel: string;
  readonly searchFilter: (query: string) => string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly tagsLabel: string;
};

/** Atomic updates emitted by native tutorial filters. */
export type FilterUpdates = {
  readonly difficulty?: string;
  readonly search?: string;
  readonly tags?: readonly string[];
};

/** Props for controlled native tutorial filtering. */
export type TutorialFiltersProps = Omit<ViewProps, "children"> & {
  readonly currentDifficulty: string;
  readonly currentTags: readonly string[];
  readonly difficultyOptions: readonly string[];
  readonly isPending?: boolean;
  readonly labels: TutorialFiltersLabels;
  readonly onFilterChange: (updates: FilterUpdates) => void;
  readonly ref?: Ref<View>;
  readonly searchQuery: string;
  readonly tags: readonly string[];
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  input: { borderWidth: 1, minHeight: 44 },
  row: { flexDirection: "row", flexWrap: "wrap" },
});

function FilterChoice({
  disabled,
  groupLabel,
  label,
  onPress,
  selected,
  type,
}: {
  readonly disabled: boolean;
  readonly groupLabel: string;
  readonly label: string;
  readonly onPress: () => void;
  readonly selected: boolean;
  readonly type: "checkbox" | "radio";
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityHint={groupLabel}
      accessibilityLabel={label}
      accessibilityRole={type}
      accessibilityState={{ busy: disabled, checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.background,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[3],
        },
      ]}
    >
      <Text
        style={typeStyle(
          theme,
          "bodySmall",
          selected ? "primaryForeground" : "foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
FilterChoice.displayName = "FilterChoice";

function ClearAction({
  disabled,
  label,
  onPress,
}: {
  readonly disabled: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.action, { opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={typeStyle(theme, "caption", "mutedForeground")}>
        {label}
      </Text>
    </Pressable>
  );
}
ClearAction.displayName = "ClearAction";

/**
 * Native filter controls without DOM queries or browser state. Group names
 * are each choice's hint (VoiceOver ignores container labels), and a pending
 * update marks the controls busy and disabled.
 */
function TutorialFilters({
  currentDifficulty,
  currentTags,
  difficultyOptions,
  isPending = false,
  labels,
  onFilterChange,
  ref,
  searchQuery,
  style,
  tags,
  ...props
}: TutorialFiltersProps) {
  const theme = useTheme();
  const generatedId = useId();
  const activeDifficulty = currentDifficulty || difficultyOptions[0] || "";
  const hasFilters = Boolean(
    currentDifficulty || currentTags.length > 0 || searchQuery,
  );

  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[4] }, style]}>
      <TextInput
        accessibilityLabel={labels.searchLabel}
        accessibilityState={{ busy: isPending, disabled: isPending }}
        editable={!isPending}
        inputMode="search"
        nativeID={`${generatedId}-search`}
        onChangeText={(search) => {
          onFilterChange({ search });
        }}
        placeholder={labels.searchPlaceholder}
        placeholderTextColor={theme.colors.mutedForeground}
        style={[
          styles.input,
          theme.typography.scale.body,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.input,
            borderRadius: theme.radius.md,
            color: theme.colors.foreground,
            opacity: isPending ? 0.5 : 1,
            paddingHorizontal: theme.spacing[4],
          },
        ]}
        value={searchQuery}
      />
      <View accessibilityRole="radiogroup" style={{ gap: theme.spacing[2] }}>
        <Text
          accessibilityRole="header"
          style={typeStyle(theme, "bodySmall", {
            color: "foreground",
            fontWeight: theme.typography.fontWeight.caption,
          })}
        >
          {labels.difficultyLabel}
        </Text>
        <View style={[styles.row, { gap: theme.spacing[2] }]}>
          {difficultyOptions.map((difficulty) => {
            const label = labels.difficulty[difficulty] ?? difficulty;
            return (
              <FilterChoice
                disabled={isPending}
                groupLabel={labels.difficultyLabel}
                key={difficulty}
                label={label}
                onPress={() => {
                  onFilterChange({ difficulty });
                }}
                selected={difficulty === activeDifficulty}
                type="radio"
              />
            );
          })}
        </View>
      </View>
      {tags.length > 0 ? (
        <View style={{ gap: theme.spacing[2] }}>
          <View
            style={[
              styles.row,
              { alignItems: "center", gap: theme.spacing[2] },
            ]}
          >
            <Text
              accessibilityRole="header"
              style={typeStyle(theme, "bodySmall", {
                color: "foreground",
                fontWeight: theme.typography.fontWeight.caption,
              })}
            >
              {labels.tagsLabel}
            </Text>
            {currentTags.length > 0 ? (
              <ClearAction
                disabled={isPending}
                label={labels.clear}
                onPress={() => {
                  onFilterChange({ tags: [] });
                }}
              />
            ) : null}
          </View>
          <View style={[styles.row, { gap: theme.spacing[2] }]}>
            {tags.map((tag) => (
              <FilterChoice
                disabled={isPending}
                groupLabel={labels.tagsLabel}
                key={tag}
                label={tag}
                onPress={() => {
                  const nextTags = currentTags.includes(tag)
                    ? currentTags.filter((current) => current !== tag)
                    : [...currentTags, tag];
                  onFilterChange({ tags: nextTags });
                }}
                selected={currentTags.includes(tag)}
                type="checkbox"
              />
            ))}
          </View>
        </View>
      ) : null}
      {hasFilters ? (
        <View
          style={[styles.row, { alignItems: "center", gap: theme.spacing[2] }]}
        >
          <Text style={typeStyle(theme, "caption", "mutedForeground")}>
            {labels.activeFilters}
          </Text>
          {currentDifficulty ? (
            <Text style={{ color: theme.colors.foreground }}>
              {labels.difficulty[currentDifficulty] ?? currentDifficulty}
            </Text>
          ) : null}
          {currentTags.map((tag) => (
            <Text key={tag} style={{ color: theme.colors.foreground }}>
              {tag}
            </Text>
          ))}
          {searchQuery ? (
            <Text style={{ color: theme.colors.foreground }}>
              {labels.searchFilter(searchQuery)}
            </Text>
          ) : null}
          <ClearAction
            disabled={isPending}
            label={labels.clearAll}
            onPress={() => {
              onFilterChange({
                difficulty: difficultyOptions[0] ?? "",
                search: "",
                tags: [],
              });
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
TutorialFilters.displayName = "TutorialFilters";

export { TutorialFilters };
