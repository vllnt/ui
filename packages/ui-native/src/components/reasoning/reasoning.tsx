"use client";

import { type ReactNode, type Ref, useCallback, useId, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** One stable text reasoning item. */
export type ReasoningStep = {
  readonly id: string;
  readonly text: string;
};

/** Caller-localized copy for the native reasoning disclosure. */
export type ReasoningLabels = {
  readonly collapse: string;
  readonly expand: string;
  readonly reasoned: string;
  readonly reasoning: string;
};

/** Props for the native reasoning disclosure. */
export type ReasoningProps = Omit<ViewProps, "children"> & {
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly duration?: ReactNode;
  readonly isStreaming?: boolean;
  readonly labels: ReasoningLabels;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly steps?: readonly ReasoningStep[];
};

const styles = StyleSheet.create({
  content: { borderTopWidth: 1 },
  pressed: { opacity: 0.8 },
  root: { borderWidth: 1, overflow: "hidden" },
  step: { flexDirection: "row" },
  trigger: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 44,
  },
  triggerLabel: { flex: 1 },
});

type TriggerProps = {
  readonly duration?: ReactNode;
  readonly isOpen: boolean;
  readonly isStreaming: boolean;
  readonly labels: ReasoningLabels;
  readonly onPress: () => void;
};

function ReasoningTrigger({
  duration,
  isOpen,
  isStreaming,
  labels,
  onPress,
}: TriggerProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={isOpen ? labels.collapse : labels.expand}
      accessibilityRole="button"
      accessibilityState={{ disabled: isStreaming, expanded: isOpen }}
      disabled={isStreaming}
      onPress={onPress}
      style={({ pressed }) => [
        styles.trigger,
        { gap: theme.spacing[2], paddingHorizontal: theme.spacing[3] },
        pressed ? styles.pressed : undefined,
      ]}
    >
      <Text
        style={[
          styles.triggerLabel,
          theme.typography.scale.bodySmall,
          {
            color: theme.colors.mutedForeground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {isStreaming ? labels.reasoning : labels.reasoned}
      </Text>
      {duration}
    </Pressable>
  );
}
ReasoningTrigger.displayName = "ReasoningTrigger";

function ReasoningContent({
  children,
  contentId,
  steps,
}: {
  readonly children?: ReactNode;
  readonly contentId: string;
  readonly steps?: readonly ReasoningStep[];
}) {
  const theme = useTheme();
  return (
    <View
      nativeID={contentId}
      style={[
        styles.content,
        {
          borderColor: theme.colors.border,
          gap: theme.spacing[2],
          padding: theme.spacing[3],
        },
      ]}
    >
      {steps && steps.length > 0
        ? steps.map((step, index) => (
            <View
              key={step.id}
              style={[styles.step, { gap: theme.spacing[2] }]}
            >
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {index + 1}.
              </Text>
              <Text
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.mutedForeground, flex: 1 },
                ]}
              >
                {step.text}
              </Text>
            </View>
          ))
        : children}
    </View>
  );
}
ReasoningContent.displayName = "ReasoningContent";

/** Collapsible text reasoning trace with controlled and uncontrolled state. */
function Reasoning({
  children,
  defaultOpen = false,
  duration,
  isStreaming = false,
  labels,
  onOpenChange,
  open,
  ref,
  steps,
  style,
  ...props
}: ReasoningProps) {
  const theme = useTheme();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const isOpen = isStreaming || (controlled ? open : internalOpen);
  const contentId = useId();
  const handleToggle = useCallback(() => {
    const next = !isOpen;
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [controlled, isOpen, onOpenChange]);

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    >
      <ReasoningTrigger
        duration={duration}
        isOpen={isOpen}
        isStreaming={isStreaming}
        labels={labels}
        onPress={handleToggle}
      />
      {isOpen ? (
        <ReasoningContent contentId={contentId} steps={steps}>
          {children}
        </ReasoningContent>
      ) : null}
    </View>
  );
}
Reasoning.displayName = "Reasoning";

export { Reasoning };
