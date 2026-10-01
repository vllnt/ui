import { type Ref, useState } from "react";

import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { joinAccessibilityText } from "../../primitives/accessibility";
import { useFontScaledSize } from "../../primitives/use-font-scaled-size";
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

function useDimensions(size: AvatarGroupSize) {
  const baseDiameter = { lg: 48, md: 40, sm: 32 }[size];
  const diameter = useFontScaledSize(baseDiameter);
  const overlap = { lg: 16, md: 12, sm: 10 }[size];
  return {
    diameter,
    overlap: Math.round((overlap * diameter) / baseDiameter),
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
  const dimensions = useDimensions(size);
  const [failedSource, setFailedSource] = useState<ImageSourcePropType>();
  return (
    <View
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
      {item.source && item.source !== failedSource ? (
        <Image
          onError={() => {
            setFailedSource(item.source);
          }}
          source={item.source}
          style={styles.image}
        />
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
  size,
}: {
  readonly count: number;
  readonly size: AvatarGroupSize;
}) {
  const theme = useTheme();
  const dimensions = useDimensions(size);
  return (
    <View
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

/**
 * Native overlapping avatar group with caller-supplied stable ids. The group is
 * one screen-reader stop that speaks its label, every visible name, and the
 * overflow count.
 */
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
  const limit = max === undefined || Number.isNaN(max) ? items.length : max;
  const visibleCount = Math.max(0, limit);
  const visibleItems = items.slice(0, visibleCount);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const hiddenLabel = overflowLabel
    ? overflowLabel(hiddenCount)
    : `${hiddenCount} more`;

  return (
    <View
      {...props}
      accessibilityLabel={joinAccessibilityText(
        [
          accessibilityLabel,
          ...visibleItems.map((item) => item.accessibilityLabel),
          hiddenCount > 0 ? hiddenLabel : undefined,
        ],
        ", ",
      )}
      accessible
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
        <AvatarOverflow count={hiddenCount} size={size} />
      ) : null}
    </View>
  );
}
AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
