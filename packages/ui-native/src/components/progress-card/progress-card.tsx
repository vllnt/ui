import type { Ref } from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge, type BadgeProps } from "../badge/badge";
import { Card } from "../card/card";
import { ProgressBar } from "../progress-bar/progress-bar";
import { Text } from "../text/text";

/** One caller-keyed metadata label in a progress card. */
export type ProgressCardMetadataItem = {
  readonly id: string;
  readonly label: string;
};

/** One caller-keyed tag in a progress card. */
export type ProgressCardTag = {
  readonly id: string;
  readonly label: string;
};

/** Props for a native progress summary card. */
export type ProgressCardProps = Omit<ViewProps, "children"> & {
  readonly badgeLabel?: string;
  readonly badgeVariant?: BadgeProps["variant"];
  readonly description: string;
  readonly max: number;
  readonly metadata?: readonly ProgressCardMetadataItem[];
  readonly onPress?: () => void;
  readonly progressLabel?: string;
  readonly ref?: Ref<View>;
  readonly tags?: readonly ProgressCardTag[];
  readonly title: string;
  readonly value: number;
};

type ProgressCardContentProps = {
  readonly badgeLabel?: string;
  readonly badgeVariant: BadgeProps["variant"];
  readonly description: string;
  readonly max: number;
  readonly metadata: readonly ProgressCardMetadataItem[];
  readonly progressLabel: string;
  readonly style: ProgressCardProps["style"];
  readonly tags: readonly ProgressCardTag[];
  readonly title: string;
  readonly value: number;
};

const styles = StyleSheet.create({
  inline: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
  pressed: { opacity: 0.8 },
});

function ProgressCardContent({
  badgeLabel,
  badgeVariant,
  description,
  max,
  metadata,
  progressLabel,
  style,
  tags,
  title,
  value,
}: ProgressCardContentProps) {
  const theme = useTheme();
  return (
    <Card style={[{ gap: theme.spacing[3], padding: theme.spacing[4] }, style]}>
      {badgeLabel ? <Badge variant={badgeVariant}>{badgeLabel}</Badge> : null}
      <View style={{ gap: theme.spacing[1] }}>
        <Text weight="semibold">{title}</Text>
        <Text size="small" tone="muted">
          {description}
        </Text>
      </View>
      <ProgressBar
        completedLabel={progressLabel}
        max={max}
        showLabels
        value={value}
      />
      {metadata.length > 0 ? (
        <View style={[styles.inline, { gap: theme.spacing[2] }]}>
          {metadata.map((item) => (
            <Text key={item.id} size="caption" tone="muted">
              {item.label}
            </Text>
          ))}
        </View>
      ) : null}
      {tags.length > 0 ? (
        <View style={[styles.inline, { gap: theme.spacing[1] }]}>
          {tags.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.label}
            </Badge>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
ProgressCardContent.displayName = "ProgressCardContent";

/** Pressable native card with explicit progress supplied by the caller. */
function ProgressCard({
  accessibilityLabel,
  badgeLabel,
  badgeVariant = "default",
  description,
  max,
  metadata = [],
  onPress,
  progressLabel = "completed",
  ref,
  style,
  tags = [],
  title,
  value,
  ...props
}: ProgressCardProps) {
  const content = (
    <ProgressCardContent
      badgeLabel={badgeLabel}
      badgeVariant={badgeVariant}
      description={description}
      max={max}
      metadata={metadata}
      progressLabel={progressLabel}
      style={style}
      tags={tags}
      title={title}
      value={value}
    />
  );

  if (!onPress) {
    return (
      <View {...props} accessibilityLabel={accessibilityLabel} ref={ref}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      onPress={onPress}
      ref={ref}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}
ProgressCard.displayName = "ProgressCard";

export { ProgressCard };
