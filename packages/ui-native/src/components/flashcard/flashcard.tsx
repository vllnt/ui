"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Caller-localized labels for a native flashcard. */
export type FlashcardLabels = {
  readonly answer: string;
  readonly answerInstruction: string;
  readonly flip: string;
  readonly hint: (hint: string) => string;
  readonly prompt: string;
  readonly promptInstruction: string;
  readonly revealAnswer: string;
  readonly showPrompt: string;
  readonly study: string;
};

/** Props for a controlled or uncontrolled native flashcard. */
export type FlashcardProps = Omit<ViewProps, "children"> & {
  readonly answer: ReactNode;
  readonly category?: string;
  readonly defaultFlipped?: boolean;
  readonly flipped?: boolean;
  readonly hint?: string;
  readonly labels: FlashcardLabels;
  readonly onFlippedChange?: (flipped: boolean) => void;
  readonly question: ReactNode;
  readonly ref?: Ref<View>;
  readonly title: string;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  root: { borderWidth: 1 },
  side: { borderWidth: 1, minHeight: 160 },
});

/** Native flashcard with no decorative flip animation, respecting reduced motion by design. */
function Flashcard({
  answer,
  category,
  defaultFlipped = false,
  flipped,
  hint,
  labels,
  onFlippedChange,
  question,
  ref,
  style,
  title,
  ...props
}: FlashcardProps) {
  const theme = useTheme();
  const [isFlipped, setFlipped] = useControllableState(
    flipped === undefined
      ? {
          defaultValue: defaultFlipped,
          mode: "uncontrolled",
          onChange: onFlippedChange,
        }
      : { mode: "controlled", onChange: onFlippedChange, value: flipped },
  );
  const toggle = () => {
    setFlipped(!isFlipped);
  };
  const actionLabel = isFlipped ? labels.showPrompt : labels.revealAnswer;
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
          gap: theme.spacing[4],
          padding: theme.spacing[6],
        },
        style,
      ]}
    >
      <View style={{ gap: theme.spacing[1] }}>
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {category ? `${labels.study} · ${category}` : labels.study}
        </Text>
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.scale.h4,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <View
        accessibilityLabel={isFlipped ? labels.answer : labels.prompt}
        accessibilityLiveRegion="polite"
        accessible
        style={[
          styles.side,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            gap: theme.spacing[3],
            padding: theme.spacing[6],
          },
        ]}
      >
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {isFlipped ? labels.answer : labels.prompt}
        </Text>
        {isFlipped ? answer : question}
      </View>
      {hint ? (
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {labels.hint(hint)}
        </Text>
      ) : null}
      <View style={[styles.footer, { gap: theme.spacing[3] }]}>
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground, flex: 1 },
          ]}
        >
          {isFlipped ? labels.answerInstruction : labels.promptInstruction}
        </Text>
        <Pressable
          accessibilityLabel={`${labels.flip}: ${actionLabel}`}
          accessibilityRole="button"
          onPress={toggle}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.md,
              opacity: pressed ? 0.8 : 1,
              paddingHorizontal: theme.spacing[4],
            },
          ]}
        >
          <Text
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.primaryForeground },
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
Flashcard.displayName = "Flashcard";

export { Flashcard };
