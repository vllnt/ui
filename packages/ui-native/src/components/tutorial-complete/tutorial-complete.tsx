import type { Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** One tutorial section available for review. */
export type TutorialCompleteSection = {
  readonly id: string;
  readonly title: string;
};

/** Related native content identified for host navigation. */
export type TutorialCompleteRelatedContent = {
  readonly id: string;
  readonly title: string;
  readonly type: string;
};

/** Caller-localized labels for the completion summary. */
export type TutorialCompleteLabels = {
  readonly backToTutorials: string;
  readonly completionSummary: (title: string, percent: number) => string;
  readonly relatedContent: string;
  readonly restart: string;
  readonly reviewSection: (title: string, completed: boolean) => string;
  readonly reviewSections: string;
  readonly share: string;
  readonly tutorialComplete: string;
  readonly tutorialFinished: string;
};

/** Props for a native tutorial completion summary. */
export type TutorialCompleteProps = Omit<ViewProps, "children"> & {
  readonly completedSectionIds: readonly string[];
  readonly completionPercent: number;
  readonly labels: TutorialCompleteLabels;
  readonly onBack: () => void;
  readonly onGoToSection: (
    section: TutorialCompleteSection,
    index: number,
  ) => void;
  readonly onRelatedContentPress?: (
    item: TutorialCompleteRelatedContent,
  ) => void;
  readonly onRestart: () => void;
  readonly onShare?: () => void;
  readonly ref?: Ref<View>;
  readonly relatedContent?: readonly TutorialCompleteRelatedContent[];
  readonly sections: readonly TutorialCompleteSection[];
  readonly title: string;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  centered: { alignItems: "center" },
  row: { alignItems: "center", flexDirection: "row" },
  sectionAction: { borderWidth: 1, minHeight: 44 },
});

function CompletionAction({
  label,
  onPress,
  primary = false,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly primary?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: primary
            ? theme.colors.primary
            : theme.colors.secondary,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[4],
        },
      ]}
    >
      <Text
        style={[
          theme.typography.scale.bodySmall,
          {
            color: primary
              ? theme.colors.primaryForeground
              : theme.colors.secondaryForeground,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
CompletionAction.displayName = "CompletionAction";

/** Native completion summary that delegates navigation and sharing to its host. */
function TutorialComplete({
  completedSectionIds,
  completionPercent,
  labels,
  onBack,
  onGoToSection,
  onRelatedContentPress,
  onRestart,
  onShare,
  ref,
  relatedContent = [],
  sections,
  style,
  title,
  ...props
}: TutorialCompleteProps) {
  const theme = useTheme();
  const percent = Math.min(100, Math.max(0, Math.round(completionPercent)));
  const complete = percent === 100;
  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[6] }, style]}>
      <View
        accessibilityLabel={labels.completionSummary(title, percent)}
        accessible
        style={[styles.centered, { gap: theme.spacing[3] }]}
      >
        <View
          style={[
            styles.centered,
            {
              backgroundColor: complete
                ? theme.colors.primary
                : theme.colors.muted,
              borderRadius: theme.radius.full,
              height: 80,
              justifyContent: "center",
              width: 80,
            },
          ]}
        >
          <Text
            style={{
              color: complete
                ? theme.colors.primaryForeground
                : theme.colors.mutedForeground,
              fontSize: 32,
            }}
          >
            ✓
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.scale.h3,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.heading,
              textAlign: "center",
            },
          ]}
        >
          {complete ? labels.tutorialComplete : labels.tutorialFinished}
        </Text>
        <Text
          style={[
            theme.typography.scale.body,
            { color: theme.colors.mutedForeground, textAlign: "center" },
          ]}
        >
          {labels.completionSummary(title, percent)}
        </Text>
        <CompletionAction label={labels.restart} onPress={onRestart} />
      </View>
      <View style={{ gap: theme.spacing[2] }}>
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
          {labels.reviewSections}
        </Text>
        {sections.map((section, index) => {
          const completed = completedSectionIds.includes(section.id);
          return (
            <Pressable
              accessibilityLabel={labels.reviewSection(
                section.title,
                completed,
              )}
              accessibilityRole="button"
              key={section.id}
              nativeID={`tutorial-section-${section.id}`}
              onPress={() => {
                onGoToSection(section, index);
              }}
              style={({ pressed }) => [
                styles.sectionAction,
                styles.row,
                {
                  backgroundColor: pressed
                    ? theme.colors.muted
                    : theme.colors.background,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  gap: theme.spacing[3],
                  padding: theme.spacing[3],
                },
              ]}
            >
              <Text
                style={{
                  color: completed
                    ? theme.colors.primary
                    : theme.colors.mutedForeground,
                  width: 20,
                }}
              >
                {completed ? "✓" : "○"}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.foreground, flex: 1 },
                ]}
              >
                {section.title}
              </Text>
              <Text style={{ color: theme.colors.mutedForeground }}>›</Text>
            </Pressable>
          );
        })}
      </View>
      {relatedContent.length > 0 && onRelatedContentPress ? (
        <View style={{ gap: theme.spacing[2] }}>
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
            {labels.relatedContent}
          </Text>
          {relatedContent.map((item) => (
            <Pressable
              accessibilityRole="link"
              key={item.id}
              onPress={() => {
                onRelatedContentPress(item);
              }}
              style={({ pressed }) => [
                styles.sectionAction,
                styles.row,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  gap: theme.spacing[3],
                  opacity: pressed ? 0.8 : 1,
                  padding: theme.spacing[3],
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.scale.caption,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {item.type}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.foreground, flex: 1 },
                ]}
              >
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View
        style={[
          styles.row,
          { flexWrap: "wrap", gap: theme.spacing[2], justifyContent: "center" },
        ]}
      >
        {onShare ? (
          <CompletionAction label={labels.share} onPress={onShare} primary />
        ) : null}
        <CompletionAction label={labels.backToTutorials} onPress={onBack} />
      </View>
    </View>
  );
}
TutorialComplete.displayName = "TutorialComplete";

export { TutorialComplete };
