import type { ReactNode, Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge } from "../badge/badge";
import { Text } from "../text/text";

/** Speaker role controlling the native message surface. */
export type AIMessageRole = "assistant" | "system" | "tool" | "user";

/** Props for a native AI conversation message. */
export type AIMessageBubbleProps = Omit<ViewProps, "children"> & {
  readonly author?: string;
  readonly children: ReactNode;
  readonly messageRole?: AIMessageRole;
  readonly ref?: Ref<View>;
  readonly status?: string;
  readonly timestamp?: string;
};

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  bubble: { borderWidth: 1 },
  message: { flexShrink: 1 },
  meta: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
  row: { alignItems: "flex-start", flexDirection: "row", width: "100%" },
  userRow: { flexDirection: "row-reverse" },
  wrapper: { width: "100%" },
});

function resolveBubbleStyle(
  role: AIMessageRole,
  colors: ReturnType<typeof useTheme>["colors"],
): ViewStyle {
  if (role === "assistant") {
    return { backgroundColor: colors.card, borderColor: colors.border };
  }
  if (role === "user") {
    return { backgroundColor: colors.secondary, borderColor: colors.primary };
  }
  if (role === "system") {
    return { backgroundColor: colors.muted, borderColor: colors.border };
  }
  return { backgroundColor: colors.accent, borderColor: colors.border };
}

function MessageAvatar({ label }: { readonly label: string }) {
  const theme = useTheme();
  return (
    <View
      accessibilityElementsHidden
      style={[
        styles.avatar,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          height: theme.spacing[8],
          width: theme.spacing[8],
        },
      ]}
    >
      <NativeText
        style={[
          theme.typography.scale.caption,
          {
            color: theme.colors.mutedForeground,
            fontWeight: theme.typography.fontWeight.caption,
            textTransform: "uppercase",
          },
        ]}
      >
        {label}
      </NativeText>
    </View>
  );
}
MessageAvatar.displayName = "MessageAvatar";

function MessageMeta({
  author,
  status,
  timestamp,
}: Pick<AIMessageBubbleProps, "author" | "status" | "timestamp">) {
  const theme = useTheme();
  if (!author && !timestamp && !status) return null;
  return (
    <View style={[styles.meta, { gap: theme.spacing[2] }]}>
      {author ? <Text weight="medium">{author}</Text> : null}
      {timestamp ? (
        <Text size="caption" tone="muted">
          {timestamp}
        </Text>
      ) : null}
      {status ? <Badge variant="secondary">{status}</Badge> : null}
    </View>
  );
}
MessageMeta.displayName = "MessageMeta";

/** Native message bubble preserving assistant, user, system, and tool roles. */
function AIMessageBubble({
  author,
  children,
  messageRole = "assistant",
  ref,
  status,
  style,
  timestamp,
  ...props
}: AIMessageBubbleProps) {
  const theme = useTheme();
  const isUser = messageRole === "user";
  const fallbackLabel = (author ?? messageRole).charAt(0).toUpperCase();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.row,
          isUser ? styles.userRow : undefined,
          { gap: theme.spacing[3] },
        ]}
      >
        <MessageAvatar label={fallbackLabel} />

        <View
          style={[
            styles.message,
            {
              alignItems: isUser ? "flex-end" : "flex-start",
              gap: theme.spacing[2],
            },
          ]}
        >
          <MessageMeta author={author} status={status} timestamp={timestamp} />
          <View
            {...props}
            ref={ref}
            style={[
              styles.bubble,
              {
                borderRadius: theme.radius.lg,
                paddingHorizontal: theme.spacing[4],
                paddingVertical: theme.spacing[3],
              },
              resolveBubbleStyle(messageRole, theme.colors),
              style,
            ]}
          >
            {typeof children === "string" || typeof children === "number" ? (
              <Text>{children}</Text>
            ) : (
              children
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
AIMessageBubble.displayName = "AIMessageBubble";

export { AIMessageBubble };
