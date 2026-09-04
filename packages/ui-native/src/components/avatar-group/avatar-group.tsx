import type { Ref } from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Native avatar group size. */
export type AvatarGroupSize = "lg" | "md" | "sm";

/** One caller-keyed avatar. */
export type AvatarGroupItem = {
  readonly accessibilityLabel: string;
  readonly fallback: string;
  readonly id: string;
  readonly source?: ImageSourcePropType;
};

/** Props for a native static avatar group. */
export type AvatarGroupProps = Omit<ViewProps, "children"> & {
  readonly items: readonly AvatarGroupItem[];
  readonly max?: number;
  readonly overflowLabel?: (hiddenCount: number) => string;
  readonly ref?: Ref<View>;
  readonly size?: AvatarGroupSize;
};

const styles = StyleSheet.create({
  avatar: { alignItems: "center", borderWidth: 2, justifyContent: "center" },
  image: { height: "100%", width: "100%" },
  root: { alignItems: "center", flexDirection: "row" },
});

function getDimensions(size: AvatarGroupSize) {
  return {
    diameter: { lg: 48, md: 40, sm: 32 }[size],
    overlap: { lg: 16, md: 12, sm: 10 }[size],
  };
}

function AvatarItem({
  index,
  item,
  size,
  total,
}: {
  readonly index: number;
  readonly item: AvatarGroupItem;
  readonly size: AvatarGroupSize;
  readonly total: number;
}) {
  const theme = useTheme();
  const dimensions = getDimensions(size);
  return (
    <View
      accessibilityLabel={item.accessibilityLabel}
      accessible
      style={[
        styles.avatar,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.background,
          borderRadius: theme.radius.full,
          height: dimensions.diameter,
          marginLeft: index === 0 ? 0 : -dimensions.overlap,
          overflow: "hidden",
          width: dimensions.diameter,
          zIndex: total - index,
        },
      ]}
    >
      {item.source ? (
        <Image source={item.source} style={styles.image} />
      ) : (
        <Text size="caption" tone="muted" weight="semibold">
          {item.fallback}
        </Text>
      )}
    </View>
  );
}
AvatarItem.displayName = "AvatarItem";

function AvatarOverflow({
  count,
  label,
  size,
}: {
  readonly count: number;
  readonly label: string;
  readonly size: AvatarGroupSize;
}) {
  const theme = useTheme();
  const dimensions = getDimensions(size);
  return (
    <View
      accessibilityLabel={label}
      accessible
      style={[
        styles.avatar,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.background,
          borderRadius: theme.radius.full,
          height: dimensions.diameter,
          marginLeft: -dimensions.overlap,
          minWidth: dimensions.diameter,
          paddingHorizontal: theme.spacing[2],
        },
      ]}
    >
      <Text size="caption" tone="muted" weight="semibold">
        +{count}
      </Text>
    </View>
  );
}
AvatarOverflow.displayName = "AvatarOverflow";

/** Native overlapping avatar group with caller-supplied stable ids. */
function AvatarGroup({
  accessibilityLabel = "Avatar group",
  items,
  max,
  overflowLabel,
  ref,
  size = "md",
  style,
  ...props
}: AvatarGroupProps) {
  const visibleCount = Math.max(0, max ?? items.length);
  const visibleItems = items.slice(0, visibleCount);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const hiddenLabel = overflowLabel
    ? overflowLabel(hiddenCount)
    : `${hiddenCount} more`;

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="none"
      ref={ref}
      style={[styles.root, style]}
    >
      {visibleItems.map((item, index) => (
        <AvatarItem
          index={index}
          item={item}
          key={item.id}
          size={size}
          total={visibleItems.length}
        />
      ))}
      {hiddenCount > 0 ? (
        <AvatarOverflow count={hiddenCount} label={hiddenLabel} size={size} />
      ) : null}
    </View>
  );
}
AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
