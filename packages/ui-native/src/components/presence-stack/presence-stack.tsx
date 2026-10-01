import type { Ref } from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";

import { joinAccessibilityText } from "../../primitives/accessibility";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Live presence state for one native participant. */
export type PresenceStatus = "active" | "away" | "idle" | "offline";

/** One caller-keyed native presence participant. */
export type PresenceUser = {
  readonly id: string;
  readonly initial: string;
  readonly name: string;
  readonly status?: PresenceStatus;
};

/** Optional localized native presence stack text. */
export type PresenceStackLabels = {
  readonly overflowSuffix?: string;
  readonly region?: string;
  /** Spoken status words. Default to the status keys ("active", "away", ...). */
  readonly statuses?: Readonly<Partial<Record<PresenceStatus, string>>>;
};

/** Props for a native live presence stack. */
export type PresenceStackProps = Omit<ViewProps, "children"> & {
  readonly labels?: PresenceStackLabels;
  readonly max?: number;
  readonly onOverflowPress?: () => void;
  readonly ref?: Ref<View>;
  readonly users: readonly PresenceUser[];
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderWidth: 2,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  dot: {
    borderWidth: 1,
    bottom: -1,
    height: 9,
    position: "absolute",
    right: -1,
    width: 9,
  },
  root: { alignItems: "center", flexDirection: "row" },
});

const overflowHitSlop = 6;

function PresenceAvatar({
  index,
  total,
  user,
}: {
  readonly index: number;
  readonly total: number;
  readonly user: PresenceUser;
}) {
  const theme = useTheme();
  const status = user.status ?? "active";
  const statusColor = {
    active: theme.colors.primary,
    away: theme.colors.accentForeground,
    idle: theme.colors.mutedForeground,
    offline: theme.colors.border,
  } satisfies Record<PresenceStatus, string>;

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: theme.colors.foreground,
          borderColor: theme.colors.background,
          borderRadius: theme.radius.full,
          marginLeft: index === 0 ? 0 : -theme.spacing[2],
          zIndex: total - index,
        },
      ]}
    >
      <Text
        size="caption"
        style={{ color: theme.colors.background }}
        weight="semibold"
      >
        {user.initial}
      </Text>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.dot,
          {
            backgroundColor: statusColor[status],
            borderColor: theme.colors.background,
            borderRadius: theme.radius.full,
          },
        ]}
      />
    </View>
  );
}
PresenceAvatar.displayName = "PresenceAvatar";

function OverflowContent({ count }: { readonly count: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.background,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing[1],
        },
      ]}
    >
      <Text size="caption" tone="muted" weight="semibold">
        +{count}
      </Text>
    </View>
  );
}
OverflowContent.displayName = "OverflowContent";

function PresenceOverflow({
  count,
  label,
  onPress,
}: {
  readonly count: number;
  readonly label: string;
  readonly onPress?: () => void;
}) {
  const theme = useTheme();
  const overlap = { marginLeft: -theme.spacing[2] };
  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        hitSlop={overflowHitSlop}
        onPress={onPress}
        style={overlap}
      >
        <OverflowContent count={count} />
      </Pressable>
    );
  }
  return (
    <View style={overlap}>
      <OverflowContent count={count} />
    </View>
  );
}
PresenceOverflow.displayName = "PresenceOverflow";

/**
 * Native live-presence avatars with textual accessibility status. The avatars
 * form one screen-reader stop that speaks the region label, every name with
 * its status, and (when not actionable) the overflow count; an actionable
 * overflow stays a separate button with a 44-point touch area.
 */
function PresenceStack({
  labels,
  max = 5,
  onOverflowPress,
  ref,
  style,
  users,
  ...props
}: PresenceStackProps) {
  const visible = users.slice(0, Math.max(0, max));
  const hidden = Math.max(0, users.length - visible.length);
  const regionLabel = labels?.region ?? "Live presence";
  const overflowLabel = `${hidden} ${labels?.overflowSuffix ?? "more"}`;
  const groupLabel = joinAccessibilityText(
    [
      regionLabel,
      ...visible.map((user) => {
        const status = user.status ?? "active";
        return `${user.name}, ${labels?.statuses?.[status] ?? status}`;
      }),
      hidden > 0 && !onOverflowPress ? overflowLabel : undefined,
    ],
    "; ",
  );
  return (
    <View {...props} ref={ref} style={[styles.root, style]}>
      <View accessibilityLabel={groupLabel} accessible style={styles.root}>
        {visible.map((user, index) => (
          <PresenceAvatar
            index={index}
            key={user.id}
            total={visible.length}
            user={user}
          />
        ))}
        {hidden > 0 && !onOverflowPress ? (
          <PresenceOverflow count={hidden} label={overflowLabel} />
        ) : null}
      </View>
      {hidden > 0 && onOverflowPress ? (
        <PresenceOverflow
          count={hidden}
          label={overflowLabel}
          onPress={onOverflowPress}
        />
      ) : null}
    </View>
  );
}
PresenceStack.displayName = "PresenceStack";

export { PresenceStack };
