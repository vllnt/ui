"use client";

import { type Ref, useCallback, useId, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useAnnounceOnChange } from "../../primitives/accessibility";
import { typeStyle } from "../../primitives/type-style";
import { useTheme } from "../../theme/theme-provider";

/** Caller-localized copy for the native thinking disclosure. */
export type ThinkingBlockLabels = {
  readonly collapse: string;
  readonly expand: string;
  readonly streaming: string;
  readonly thinking: string;
};

/** Props for a text native thinking disclosure. */
export type ThinkingBlockProps = Omit<ViewProps, "children"> & {
  readonly defaultExpanded?: boolean;
  readonly expanded?: boolean;
  readonly isStreaming?: boolean;
  readonly labels: ThinkingBlockLabels;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly ref?: Ref<View>;
  readonly thinking: string;
};

const styles = StyleSheet.create({
  content: { borderLeftWidth: 1 },
  pressed: { opacity: 0.8 },
  trigger: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 44,
  },
});

function ThinkingContent({
  contentId,
  thinking,
}: {
  readonly contentId: string;
  readonly thinking: string;
}) {
  const theme = useTheme();
  return (
    <View
      nativeID={contentId}
      style={[
        styles.content,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          padding: theme.spacing[3],
        },
      ]}
    >
      <Text style={typeStyle(theme, "caption", "mutedForeground")}>
        {thinking}
      </Text>
    </View>
  );
}
ThinkingContent.displayName = "ThinkingContent";

/**
 * Collapsible text thinking trace for React Native. The trigger speaks the
 * visible status as its value and reports `busy` while streaming; it announces
 * the status when streaming starts and ends, never per token.
 */
function ThinkingBlock({
  defaultExpanded = false,
  expanded,
  isStreaming = false,
  labels,
  onExpandedChange,
  ref,
  style,
  thinking,
  ...props
}: ThinkingBlockProps) {
  const theme = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const controlled = expanded !== undefined;
  const isExpanded = isStreaming || (controlled ? expanded : internalExpanded);
  const contentId = useId();
  const status = isStreaming ? labels.streaming : labels.thinking;
  useAnnounceOnChange(status);
  const handleToggle = useCallback(() => {
    const next = !isExpanded;
    if (!controlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [controlled, isExpanded, onExpandedChange]);

  return (
    <View {...props} ref={ref} style={style}>
      <Pressable
        accessibilityLabel={isExpanded ? labels.collapse : labels.expand}
        accessibilityRole="button"
        accessibilityState={{
          busy: isStreaming,
          disabled: isStreaming,
          expanded: isExpanded,
        }}
        accessibilityValue={{ text: status }}
        disabled={isStreaming}
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.trigger,
          { gap: theme.spacing[2] },
          pressed ? styles.pressed : undefined,
        ]}
      >
        <Text
          style={typeStyle(theme, "caption", {
            color: "mutedForeground",
            fontWeight: theme.typography.fontWeight.caption,
          })}
        >
          {status}
        </Text>
      </Pressable>
      {isExpanded ? (
        <ThinkingContent contentId={contentId} thinking={thinking} />
      ) : null}
    </View>
  );
}
ThinkingBlock.displayName = "ThinkingBlock";

export { ThinkingBlock };
