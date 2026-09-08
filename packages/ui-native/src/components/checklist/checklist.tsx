"use client";

import { type Ref, useId } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** One stable item in a native checklist. */
export type ChecklistItem = {
  readonly description?: string;
  readonly id: string;
  readonly label: string;
};

/** Caller-localized checklist labels. */
export type ChecklistLabels = {
  readonly allCompleted: string;
  readonly item: (item: ChecklistItem, checked: boolean) => string;
  readonly progress: (checked: number, total: number) => string;
};

/** Props for a controlled or uncontrolled native checklist. */
export type ChecklistProps = Omit<ViewProps, "children"> & {
  readonly checkedIds?: readonly string[];
  readonly defaultCheckedIds?: readonly string[];
  readonly items: readonly ChecklistItem[];
  readonly labels: ChecklistLabels;
  readonly onCheckedIdsChange?: (ids: readonly string[]) => void;
  readonly onComplete?: () => void;
  readonly ref?: Ref<View>;
  readonly title?: string;
};

const styles = StyleSheet.create({
  indicator: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  item: { alignItems: "flex-start", flexDirection: "row", minHeight: 44 },
  progressFill: { height: "100%" },
  progressTrack: { height: 8, overflow: "hidden" },
  root: { borderWidth: 1 },
});

function uniqueKnownIds(
  ids: readonly string[],
  items: readonly ChecklistItem[],
): readonly string[] {
  const known = new Set(items.map((item) => item.id));
  return [...new Set(ids.filter((id) => known.has(id)))];
}

/** Native checklist that leaves persistence to a host adapter. */
function Checklist({
  checkedIds,
  defaultCheckedIds = [],
  items,
  labels,
  onCheckedIdsChange,
  onComplete,
  ref,
  style,
  title,
  ...props
}: ChecklistProps) {
  const theme = useTheme();
  const generatedId = useId();
  const [selectedIds, setSelectedIds] = useControllableState(
    checkedIds === undefined
      ? {
          defaultValue: uniqueKnownIds(defaultCheckedIds, items),
          mode: "uncontrolled",
          onChange: onCheckedIdsChange,
        }
      : {
          mode: "controlled",
          onChange: onCheckedIdsChange,
          value: uniqueKnownIds(checkedIds, items),
        },
  );
  const knownSelectedIds = uniqueKnownIds(selectedIds, items);
  const selected = new Set(knownSelectedIds);
  const progress =
    items.length === 0 ? 0 : Math.round((selected.size / items.length) * 100);
  const progressText = labels.progress(selected.size, items.length);
  const allCompleted = items.length > 0 && selected.size === items.length;

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing[3],
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      {title ? (
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            accessibilityRole="header"
            style={[
              theme.typography.scale.bodyLarge,
              {
                color: theme.colors.foreground,
                fontWeight: theme.typography.fontWeight.heading,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              theme.typography.scale.caption,
              { color: theme.colors.mutedForeground },
            ]}
          >
            {progressText}
          </Text>
        </View>
      ) : null}
      <View
        accessibilityLabel={progressText}
        accessibilityRole="progressbar"
        accessibilityValue={{
          max: items.length,
          min: 0,
          now: selected.size,
          text: progressText,
        }}
        accessible
        nativeID={`${generatedId}-progress`}
        style={[
          styles.progressTrack,
          {
            backgroundColor: theme.colors.muted,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <View style={{ gap: theme.spacing[2] }}>
        {items.map((item) => {
          const checked = selected.has(item.id);
          return (
            <Pressable
              accessibilityLabel={labels.item(item, checked)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              key={item.id}
              nativeID={`${generatedId}-item-${item.id}`}
              onPress={() => {
                const next = checked
                  ? knownSelectedIds.filter((id) => id !== item.id)
                  : [...knownSelectedIds, item.id];
                setSelectedIds(next);
                if (
                  !checked &&
                  items.length > 0 &&
                  next.length === items.length
                )
                  onComplete?.();
              }}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: pressed
                    ? theme.colors.muted
                    : theme.colors.card,
                  borderRadius: theme.radius.md,
                  gap: theme.spacing[3],
                  opacity: checked ? 0.7 : 1,
                  padding: theme.spacing[2],
                },
              ]}
            >
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor: checked
                      ? theme.colors.primary
                      : theme.colors.background,
                    borderColor: checked
                      ? theme.colors.primary
                      : theme.colors.input,
                    borderRadius: theme.radius.sm,
                    borderWidth: 1,
                  },
                ]}
              >
                {checked ? (
                  <Text style={{ color: theme.colors.primaryForeground }}>
                    ✓
                  </Text>
                ) : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    theme.typography.scale.bodySmall,
                    {
                      color: theme.colors.foreground,
                      textDecorationLine: checked ? "line-through" : "none",
                    },
                  ]}
                >
                  {item.label}
                </Text>
                {item.description ? (
                  <Text
                    style={[
                      theme.typography.scale.caption,
                      {
                        color: theme.colors.mutedForeground,
                        marginTop: theme.spacing[1],
                      },
                    ]}
                  >
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {allCompleted ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.foreground, textAlign: "center" },
          ]}
        >
          {labels.allCompleted}
        </Text>
      ) : null}
    </View>
  );
}
Checklist.displayName = "Checklist";

export { Checklist };
