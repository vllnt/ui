import { useState } from "react";

import type { Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge, type BadgeProps } from "../badge/badge";
import { Text } from "../text/text";

/** Execution state for a native AI tool call. */
export type AIToolCallStatus = "complete" | "error" | "queued" | "running";

/** Props for a native AI tool call display. */
export type AIToolCallDisplayProps = Omit<ViewProps, "children"> & {
  readonly description?: string;
  readonly duration?: string;
  readonly input?: string;
  readonly output?: string;
  readonly ref?: Ref<View>;
  readonly status?: AIToolCallStatus;
  readonly toolName: string;
};

type ToolSectionProps = {
  readonly defaultExpanded: boolean;
  readonly label: string;
  readonly value: string;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  meta: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
  root: { borderWidth: 1, width: "100%" },
  section: { borderWidth: 1, overflow: "hidden" },
  sectionTrigger: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
});

const statusVariants: Record<
  AIToolCallStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  complete: "default",
  error: "destructive",
  queued: "secondary",
  running: "secondary",
};

function ToolSection({ defaultExpanded, label, value }: ToolSectionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => {
          setIsExpanded((current) => !current);
        }}
        style={[
          styles.sectionTrigger,
          {
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
          },
        ]}
      >
        <Text size="caption" tone="muted" weight="medium">
          {label}
        </Text>
        <NativeText
          accessibilityElementsHidden
          style={{ color: theme.colors.mutedForeground }}
        >
          {isExpanded ? "−" : "+"}
        </NativeText>
      </Pressable>
      {isExpanded ? (
        <NativeText
          selectable
          style={[
            theme.typography.scale.caption,
            {
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              color: theme.colors.foreground,
              padding: theme.spacing[3],
            },
          ]}
        >
          {value}
        </NativeText>
      ) : null}
    </View>
  );
}
ToolSection.displayName = "ToolSection";

/** Native tool execution summary with expandable plain-text payloads. */
function AIToolCallDisplay({
  description,
  duration,
  input,
  output,
  ref,
  status = "queued",
  style,
  toolName,
  ...props
}: AIToolCallDisplayProps) {
  const theme = useTheme();
  const defaultExpanded = status !== "complete";

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          gap: theme.spacing[3],
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      <View style={[styles.header, { gap: theme.spacing[3] }]}>
        <View style={{ flexShrink: 1, gap: theme.spacing[1] }}>
          <Text weight="medium">{toolName}</Text>
          {description ? <Text tone="muted">{description}</Text> : null}
        </View>
        <View style={[styles.meta, { gap: theme.spacing[2] }]}>
          {duration ? (
            <Text size="caption" tone="muted">
              {duration}
            </Text>
          ) : null}
          <Badge variant={statusVariants[status]}>{status}</Badge>
        </View>
      </View>
      {input ? (
        <ToolSection
          defaultExpanded={defaultExpanded}
          label="Tool input"
          value={input}
        />
      ) : null}
      {output ? (
        <ToolSection
          defaultExpanded={defaultExpanded}
          label="Tool output"
          value={output}
        />
      ) : null}
    </View>
  );
}
AIToolCallDisplay.displayName = "AIToolCallDisplay";

export { AIToolCallDisplay };
