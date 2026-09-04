import type { ReactNode, Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Button } from "../button/button";
import { Heading } from "../heading/heading";

/** A navigable section shown by ContentIntro. */
export type ContentIntroSection = {
  readonly id: string;
  readonly title: string;
};

/** Localizable labels for ContentIntro. */
export type ContentIntroLabels = {
  readonly continueLabel?: string;
  readonly startLabel?: string;
  readonly tableOfContentsLabel?: string;
};

/** Props for the native tutorial introduction. */
export type ContentIntroProps = Omit<ViewProps, "children"> & {
  readonly additionalContent?: ReactNode;
  readonly completedSections: ReadonlySet<string>;
  readonly estimatedTime: string;
  readonly isLoading?: boolean;
  readonly labels?: ContentIntroLabels;
  readonly onGoToSection: (index: number) => void;
  readonly onStart: () => void;
  readonly ref?: Ref<View>;
  readonly renderIntroContent: () => ReactNode;
  readonly sections: readonly ContentIntroSection[];
  readonly title: string;
};

const defaultLabels: Required<ContentIntroLabels> = {
  continueLabel: "Continue Tutorial",
  startLabel: "Start Tutorial",
  tableOfContentsLabel: "Table of Contents",
};

const styles = StyleSheet.create({
  completedTitle: { textDecorationLine: "line-through" },
  marker: { alignItems: "center", justifyContent: "center" },
  root: { width: "100%" },
  sectionButton: { alignItems: "center", flexDirection: "row", minHeight: 44 },
});

type SectionListProps = {
  readonly completedSections: ReadonlySet<string>;
  readonly isLoading: boolean;
  readonly label: string;
  readonly onGoToSection: (index: number) => void;
  readonly sections: readonly ContentIntroSection[];
};

function SectionMarker({
  completed,
  index,
}: {
  readonly completed: boolean;
  readonly index: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.marker,
        {
          backgroundColor: completed
            ? theme.colors.primary
            : theme.colors.muted,
          borderRadius: theme.radius.full,
          height: theme.spacing[6],
          width: theme.spacing[6],
        },
      ]}
    >
      <NativeText
        style={[
          theme.typography.scale.caption,
          {
            color: completed
              ? theme.colors.primaryForeground
              : theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {completed ? "✓" : index + 1}
      </NativeText>
    </View>
  );
}
SectionMarker.displayName = "SectionMarker";

function ContentIntroSectionRow({
  completed,
  index,
  onPress,
  section,
}: {
  readonly completed: boolean;
  readonly index: number;
  readonly onPress: () => void;
  readonly section: ContentIntroSection;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={section.title}
      accessibilityRole="button"
      accessibilityState={{ selected: completed }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sectionButton,
        {
          backgroundColor: pressed
            ? theme.colors.accent
            : theme.colors.background,
          borderRadius: theme.radius.md,
          gap: theme.spacing[3],
          opacity: pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[2],
        },
      ]}
    >
      <SectionMarker completed={completed} index={index} />
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          {
            color: completed
              ? theme.colors.mutedForeground
              : theme.colors.foreground,
          },
          completed ? styles.completedTitle : undefined,
        ]}
      >
        {section.title}
      </NativeText>
    </Pressable>
  );
}
ContentIntroSectionRow.displayName = "ContentIntroSectionRow";

function ContentIntroSections({
  completedSections,
  isLoading,
  label,
  onGoToSection,
  sections,
}: SectionListProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        gap: theme.spacing[2],
        paddingTop: theme.spacing[6],
      }}
    >
      <Heading level={3} size={6}>
        {label}
      </Heading>
      {sections.map((section, index) => (
        <ContentIntroSectionRow
          completed={!isLoading && completedSections.has(section.id)}
          index={index}
          key={section.id}
          onPress={() => {
            onGoToSection(index);
          }}
          section={section}
        />
      ))}
    </View>
  );
}
ContentIntroSections.displayName = "ContentIntroSections";

type IntroFooterProps = {
  readonly completedCount: number;
  readonly estimatedTime: string;
  readonly labels: Required<ContentIntroLabels>;
  readonly onStart: () => void;
  readonly sectionCount: number;
};

function ContentIntroFooter({
  completedCount,
  estimatedTime,
  labels,
  onStart,
  sectionCount,
}: IntroFooterProps) {
  const theme = useTheme();
  const hasProgress = completedCount > 0;
  return (
    <View
      style={{
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        gap: theme.spacing[3],
        paddingTop: theme.spacing[4],
      }}
    >
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          { color: theme.colors.mutedForeground },
        ]}
      >
        {hasProgress
          ? `${completedCount}/${sectionCount} completed`
          : `${sectionCount} sections · ${estimatedTime}`}
      </NativeText>
      <Button onPress={onStart} size="lg">
        {hasProgress ? labels.continueLabel : labels.startLabel}
      </Button>
    </View>
  );
}
ContentIntroFooter.displayName = "ContentIntroFooter";

/** Native tutorial introduction with an accessible section index. */
function ContentIntro({
  additionalContent,
  completedSections,
  estimatedTime,
  isLoading = false,
  labels,
  onGoToSection,
  onStart,
  ref,
  renderIntroContent,
  sections,
  style,
  title,
  ...props
}: ContentIntroProps) {
  const theme = useTheme();
  const resolvedLabels: Required<ContentIntroLabels> = {
    continueLabel: labels?.continueLabel ?? defaultLabels.continueLabel,
    startLabel: labels?.startLabel ?? defaultLabels.startLabel,
    tableOfContentsLabel:
      labels?.tableOfContentsLabel ?? defaultLabels.tableOfContentsLabel,
  };

  return (
    <View
      {...props}
      ref={ref}
      style={[styles.root, { gap: theme.spacing[6] }, style]}
    >
      <View style={{ gap: theme.spacing[4] }}>
        <Heading level={2} size={4}>
          {title}
        </Heading>
        {renderIntroContent()}
      </View>
      <ContentIntroSections
        completedSections={completedSections}
        isLoading={isLoading}
        label={resolvedLabels.tableOfContentsLabel}
        onGoToSection={onGoToSection}
        sections={sections}
      />
      {additionalContent}
      <ContentIntroFooter
        completedCount={completedSections.size}
        estimatedTime={estimatedTime}
        labels={resolvedLabels}
        onStart={onStart}
        sectionCount={sections.length}
      />
    </View>
  );
}
ContentIntro.displayName = "ContentIntro";

export { ContentIntro };
