import type { Ref } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { decorativeProps } from "../../../primitives/accessibility";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { typeStyle } from "../../../primitives/type-style";
import { useTheme } from "../../../theme/theme-provider";

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
  },
  centered: { alignItems: "center" },
  row: { alignItems: "center", flexDirection: "row" },
  sectionAction: { borderWidth: 1 },
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
    <InteractivePressable
      accessibilityRole="button"
      filled
      onPress={onPress}
      style={[
        styles.action,
        {
          backgroundColor: primary
            ? theme.colors.primary
            : theme.colors.secondary,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing[4],
        },
      ]}
    >
      <Text
        style={typeStyle(
          theme,
          "bodySmall",
          primary ? "primaryForeground" : "secondaryForeground",
        )}
      >
        {label}
      </Text>
    </InteractivePressable>
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
  const percent = Number.isNaN(completionPercent)
    ? 0
    : Math.min(100, Math.max(0, Math.round(completionPercent)));
  const complete = percent === 100;
  const completedIdSet = new Set(completedSectionIds);
  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[6] }, style]}>
      <View style={[styles.centered, { gap: theme.spacing[3] }]}>
        <View
          {...decorativeProps}
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
          style={typeStyle(theme, "h3", {
            color: "foreground",
            fontWeight: theme.typography.fontWeight.heading,
            textAlign: "center",
          })}
        >
          {complete ? labels.tutorialComplete : labels.tutorialFinished}
        </Text>
        <Text
          style={typeStyle(theme, "body", {
            color: "mutedForeground",
            textAlign: "center",
          })}
        >
          {labels.completionSummary(title, percent)}
        </Text>
        <CompletionAction label={labels.restart} onPress={onRestart} />
      </View>
      <View style={{ gap: theme.spacing[2] }}>
        <Text
          accessibilityRole="header"
          style={typeStyle(theme, "bodyLarge", {
            color: "foreground",
            fontWeight: theme.typography.fontWeight.heading,
          })}
        >
          {labels.reviewSections}
        </Text>
        {sections.map((section, index) => {
          const completed = completedIdSet.has(section.id);
          return (
            <InteractivePressable
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
              style={[
                styles.sectionAction,
                styles.row,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  gap: theme.spacing[3],
                  padding: theme.spacing[3],
                },
              ]}
            >
              <Text
                {...decorativeProps}
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
                style={typeStyle(theme, "bodySmall", {
                  color: "foreground",
                  flex: 1,
                })}
              >
                {section.title}
              </Text>
              <Text
                {...decorativeProps}
                style={{ color: theme.colors.mutedForeground }}
              >
                ›
              </Text>
            </InteractivePressable>
          );
        })}
      </View>
      {relatedContent.length > 0 && onRelatedContentPress ? (
        <View style={{ gap: theme.spacing[2] }}>
          <Text
            accessibilityRole="header"
            style={typeStyle(theme, "bodyLarge", {
              color: "foreground",
              fontWeight: theme.typography.fontWeight.heading,
            })}
          >
            {labels.relatedContent}
          </Text>
          {relatedContent.map((item) => (
            <InteractivePressable
              accessibilityLabel={`${item.type}, ${item.title}`}
              accessibilityRole="link"
              key={item.id}
              onPress={() => {
                onRelatedContentPress(item);
              }}
              style={[
                styles.sectionAction,
                styles.row,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  gap: theme.spacing[3],
                  padding: theme.spacing[3],
                },
              ]}
            >
              <Text style={typeStyle(theme, "caption", "mutedForeground")}>
                {item.type}
              </Text>
              <Text
                style={typeStyle(theme, "bodySmall", {
                  color: "foreground",
                  flex: 1,
                })}
              >
                {item.title}
              </Text>
            </InteractivePressable>
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
