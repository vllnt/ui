import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import {
  joinAccessibilityText,
  plainText,
} from "../../primitives/accessibility";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Density options for a native data list. */
export type DataListDensity = "compact" | "default";

/** One caller-keyed label and value in a native data list. */
export type DataListItem = {
  readonly accessibilityLabel?: string;
  readonly id: string;
  readonly label: ReactNode;
  readonly value: ReactNode;
};

/** Props for a token-driven native key-value list. */
export type DataListProps = Omit<ViewProps, "children"> & {
  readonly density?: DataListDensity;
  readonly emptyLabel?: string;
  readonly items: readonly DataListItem[];
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    borderBottomWidth: 1,
  },
});

function DataRow({
  density,
  isLast,
  item,
  listHint,
}: {
  readonly density: DataListDensity;
  readonly isLast: boolean;
  readonly item: DataListItem;
  readonly listHint?: string;
}) {
  const theme = useTheme();
  const verticalPadding =
    density === "compact" ? theme.spacing[3] : theme.spacing[4];
  const label = plainText(item.label);
  const value = plainText(item.value);
  const spoken =
    item.accessibilityLabel ??
    (label === undefined || value === undefined
      ? undefined
      : joinAccessibilityText([label, value], ", "));
  return (
    <View
      {...(spoken === undefined
        ? undefined
        : {
            accessibilityHint: listHint,
            accessibilityLabel: spoken,
            accessibilityRole: "text" as const,
            accessible: true,
          })}
      style={[
        styles.row,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: isLast ? 0 : 1,
          gap: theme.spacing[1],
          paddingHorizontal: theme.spacing[4],
          paddingVertical: verticalPadding,
        },
      ]}
    >
      <Text
        accessibilityHint={spoken === undefined ? listHint : undefined}
        size="small"
        tone="muted"
        weight="medium"
      >
        {item.label}
      </Text>
      <Text size="small">{item.value}</Text>
    </View>
  );
}
DataRow.displayName = "DataRow";

/**
 * Native key-value metadata list with caller-supplied stable item ids. A row
 * with an `accessibilityLabel`, or with plain-text label and value, is one
 * screen-reader stop that speaks "label, value"; rows with element content
 * (links, custom nodes) keep each part reachable on its own. VoiceOver ignores
 * names on non-focusable containers, so the list keeps the list role and
 * speaks its `accessibilityLabel` as the first row's hint; a visible
 * heading next to the list names it for everyone.
 */
function DataList({
  accessibilityLabel,
  density = "default",
  emptyLabel = "No data available.",
  items,
  ref,
  style,
  ...props
}: DataListProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessibilityRole="list"
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    >
      {items.length === 0 ? (
        <View style={{ padding: theme.spacing[4] }}>
          <Text
            accessibilityHint={accessibilityLabel}
            size="small"
            tone="muted"
          >
            {emptyLabel}
          </Text>
        </View>
      ) : (
        items.map((item, index) => (
          <DataRow
            density={density}
            isLast={index === items.length - 1}
            item={item}
            key={item.id}
            listHint={index === 0 ? accessibilityLabel : undefined}
          />
        ))
      )}
    </View>
  );
}
DataList.displayName = "DataList";

export { DataList };
