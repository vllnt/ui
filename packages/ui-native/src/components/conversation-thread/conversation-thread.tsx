"use client";

import {
  createContext,
  type Ref,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  type Text as NativeText,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import {
  ThinkingBlock,
  type ThinkingBlockLabels,
} from "../thinking-block/thinking-block";

/** A tool invocation associated with an assistant message. */
export type ToolCall = {
  readonly id: string;
  readonly input?: Readonly<Record<string, unknown>>;
  readonly name: string;
  readonly result?: string;
};

/** One stable message in a native conversation. */
export type ConversationMessage = {
  readonly content: string;
  readonly id: string;
  readonly isStreaming?: boolean;
  readonly role: "assistant" | "user";
  readonly thinking?: string;
  readonly toolCalls?: readonly ToolCall[];
};

/** One stable, caller-localized suggested prompt. */
export type ConversationSuggestion = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};

/** Caller-localized labels for conversation state and actions. */
export type ConversationThreadLabels = {
  readonly assistantMessage: string;
  readonly assistantTyping: string;
  readonly negativeFeedback: string;
  readonly positiveFeedback: string;
  readonly retry: string;
  readonly scrollToBottom: string;
  readonly toolCalls: string;
  readonly userMessage: string;
};

/** Props for the native conversation provider. */
export type ConversationThreadProps = ViewProps & {
  readonly isStreaming?: boolean;
  readonly labels: ConversationThreadLabels;
  readonly messages: readonly ConversationMessage[];
  readonly onFeedback?: (
    messageId: string,
    feedback: "negative" | "positive",
  ) => void;
  readonly onRetry?: (messageId: string) => void;
  readonly onSend?: (message: string) => void;
  readonly ref?: Ref<View>;
  readonly thinkingLabels: ThinkingBlockLabels;
};

export type ConversationHeaderProps = ViewProps & { readonly ref?: Ref<View> };
export type ConversationTitleProps = TextProps & {
  readonly ref?: Ref<NativeText>;
};
export type ConversationMessagesProps = ViewProps & {
  readonly ref?: Ref<View>;
};
export type ConversationEmptyProps = ViewProps & { readonly ref?: Ref<View> };
export type ConversationSuggestionsProps = Omit<ViewProps, "children"> & {
  readonly ref?: Ref<View>;
  readonly suggestions?: readonly ConversationSuggestion[];
};
export type ConversationScrollButtonProps = Omit<ViewProps, "children"> & {
  readonly ref?: Ref<View>;
};
export type ConversationLoadingProps = Omit<ViewProps, "children"> & {
  readonly ref?: Ref<View>;
};

type ConversationContextValue = {
  readonly isAtBottom: boolean;
  readonly isStreaming: boolean;
  readonly labels: ConversationThreadLabels;
  readonly messages: readonly ConversationMessage[];
  readonly onFeedback?: ConversationThreadProps["onFeedback"];
  readonly onRetry?: ConversationThreadProps["onRetry"];
  readonly onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  readonly onSend?: ConversationThreadProps["onSend"];
  readonly scrollToBottom: () => void;
  readonly scrollViewRef: Ref<ScrollView>;
  readonly thinkingLabels: ThinkingBlockLabels;
};

const ConversationContext = createContext<ConversationContextValue | null>(
  null,
);

function useConversation(): ConversationContextValue {
  const context = use(ConversationContext);
  if (!context) {
    throw new Error(
      "ConversationThread parts must be rendered inside ConversationThread.",
    );
  }
  return context;
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bubble: {
    maxWidth: "80%",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  message: {
    flexDirection: "row",
  },
  messageAssistant: {
    justifyContent: "flex-start",
  },
  messages: {
    flex: 1,
  },
  messageUser: {
    justifyContent: "flex-end",
  },
  pressed: {
    opacity: 0.8,
  },
  root: {
    flex: 1,
    overflow: "hidden",
  },
  scrollButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  suggestion: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  suggestions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  toolList: {
    borderLeftWidth: 1,
  },
});

function MessageAction({
  label,
  onPress,
}: {
  readonly label: string;
  readonly onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing[2] },
        pressed ? styles.pressed : undefined,
      ]}
    >
      <Text
        style={[
          theme.typography.scale.caption,
          { color: theme.colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
MessageAction.displayName = "MessageAction";

function MessageTools({
  label,
  toolCalls,
}: {
  readonly label: string;
  readonly toolCalls?: readonly ToolCall[];
}) {
  const theme = useTheme();
  if (!toolCalls || toolCalls.length === 0) return null;
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="list"
      style={[
        styles.toolList,
        {
          borderColor: theme.colors.border,
          gap: theme.spacing[1],
          marginBottom: theme.spacing[2],
          paddingLeft: theme.spacing[2],
        },
      ]}
    >
      {toolCalls.map((toolCall) => (
        <Text
          key={toolCall.id}
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {toolCall.name}
        </Text>
      ))}
    </View>
  );
}
MessageTools.displayName = "MessageTools";

function MessageActions({ messageId }: { readonly messageId: string }) {
  const theme = useTheme();
  const { labels, onFeedback, onRetry } = useConversation();
  if (!onRetry && !onFeedback) return null;
  return (
    <View style={[styles.actions, { gap: theme.spacing[1] }]}>
      {onRetry ? (
        <MessageAction
          label={labels.retry}
          onPress={() => {
            onRetry(messageId);
          }}
        />
      ) : null}
      {onFeedback ? (
        <>
          <MessageAction
            label={labels.positiveFeedback}
            onPress={() => {
              onFeedback(messageId, "positive");
            }}
          />
          <MessageAction
            label={labels.negativeFeedback}
            onPress={() => {
              onFeedback(messageId, "negative");
            }}
          />
        </>
      ) : null}
    </View>
  );
}
MessageActions.displayName = "MessageActions";

function MessageItem({ message }: { readonly message: ConversationMessage }) {
  const theme = useTheme();
  const { labels, thinkingLabels } = useConversation();
  const isUser = message.role === "user";
  const roleLabel = isUser ? labels.userMessage : labels.assistantMessage;

  return (
    <View
      accessibilityLabel={roleLabel}
      style={[
        styles.message,
        isUser ? styles.messageUser : styles.messageAssistant,
        { marginBottom: theme.spacing[4] },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? theme.colors.primary : theme.colors.muted,
            borderRadius: theme.radius.lg,
            padding: theme.spacing[3],
          },
        ]}
      >
        {!isUser && message.thinking ? (
          <ThinkingBlock
            isStreaming={message.isStreaming}
            labels={thinkingLabels}
            thinking={message.thinking}
          />
        ) : null}
        <MessageTools label={labels.toolCalls} toolCalls={message.toolCalls} />
        <Text
          accessibilityLiveRegion={message.isStreaming ? "polite" : "none"}
          style={[
            theme.typography.scale.bodySmall,
            {
              color: isUser
                ? theme.colors.primaryForeground
                : theme.colors.foreground,
            },
          ]}
        >
          {message.content}
        </Text>
        {isUser ? null : <MessageActions messageId={message.id} />}
      </View>
    </View>
  );
}
MessageItem.displayName = "MessageItem";

/** Root state provider for the native conversation compound family. */
function ConversationThread({
  children,
  isStreaming = false,
  labels,
  messages,
  onFeedback,
  onRetry,
  onSend,
  ref,
  style,
  thinkingLabels,
  ...props
}: ConversationThreadProps) {
  const scrollViewReference = useRef<ScrollView>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    scrollViewReference.current?.scrollToEnd({ animated: false });
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      setIsAtBottom(
        contentSize.height - contentOffset.y - layoutMeasurement.height <= 100,
      );
    },
    [],
  );

  const context = useMemo<ConversationContextValue>(
    () => ({
      isAtBottom,
      isStreaming,
      labels,
      messages,
      onFeedback,
      onRetry,
      onScroll: handleScroll,
      onSend,
      scrollToBottom,
      scrollViewRef: scrollViewReference,
      thinkingLabels,
    }),
    [
      handleScroll,
      isAtBottom,
      isStreaming,
      labels,
      messages,
      onFeedback,
      onRetry,
      onSend,
      scrollToBottom,
      thinkingLabels,
    ],
  );

  return (
    <ConversationContext value={context}>
      <View {...props} ref={ref} style={[styles.root, style]}>
        {children}
      </View>
    </ConversationContext>
  );
}
ConversationThread.displayName = "ConversationThread";

/** Header region above a native conversation. */
function ConversationHeader({ ref, style, ...props }: ConversationHeaderProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.header,
        {
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        },
        style,
      ]}
    />
  );
}
ConversationHeader.displayName = "ConversationHeader";

/** Accessible heading text for a native conversation. */
function ConversationTitle({ ref, style, ...props }: ConversationTitleProps) {
  const theme = useTheme();
  return (
    <Text
      {...props}
      accessibilityRole="header"
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.heading,
        },
        style,
      ]}
    />
  );
}
ConversationTitle.displayName = "ConversationTitle";

/** Scrollable, live-updating native message list. */
function ConversationMessages({
  children,
  ref,
  style,
  ...props
}: ConversationMessagesProps) {
  const theme = useTheme();
  const {
    isAtBottom,
    labels,
    messages,
    onScroll,
    scrollToBottom,
    scrollViewRef,
  } = useConversation();
  return (
    <View {...props} ref={ref} style={[styles.messages, style]}>
      <ScrollView
        accessibilityLabel={labels.assistantMessage}
        accessibilityLiveRegion="polite"
        accessibilityRole="list"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={isAtBottom ? scrollToBottom : undefined}
        onScroll={onScroll}
        ref={scrollViewRef}
        scrollEventThrottle={32}
      >
        <View style={{ padding: theme.spacing[4] }}>
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </View>
      </ScrollView>
      {children}
    </View>
  );
}
ConversationMessages.displayName = "ConversationMessages";

/** Empty-state region rendered when the conversation has no messages. */
function ConversationEmpty({ ref, style, ...props }: ConversationEmptyProps) {
  const theme = useTheme();
  const { messages } = useConversation();
  if (messages.length > 0) return null;
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.empty,
        { gap: theme.spacing[4], padding: theme.spacing[8] },
        style,
      ]}
    />
  );
}
ConversationEmpty.displayName = "ConversationEmpty";

/** Stable suggested prompts for a native conversation empty state. */
function ConversationSuggestions({
  ref,
  style,
  suggestions = [],
  ...props
}: ConversationSuggestionsProps) {
  const theme = useTheme();
  const { onSend } = useConversation();
  return (
    <View
      {...props}
      ref={ref}
      style={[styles.suggestions, { gap: theme.spacing[2] }, style]}
    >
      {suggestions.map((suggestion) => (
        <Pressable
          accessibilityLabel={suggestion.label}
          accessibilityRole="button"
          key={suggestion.id}
          onPress={() => onSend?.(suggestion.value)}
          style={({ pressed }) => [
            styles.suggestion,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.full,
              paddingHorizontal: theme.spacing[4],
            },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.foreground },
            ]}
          >
            {suggestion.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
ConversationSuggestions.displayName = "ConversationSuggestions";

/** Action shown while the native message list is away from its end. */
function ConversationScrollButton({
  ref,
  style,
  ...props
}: ConversationScrollButtonProps) {
  const theme = useTheme();
  const { isAtBottom, labels, scrollToBottom } = useConversation();
  if (isAtBottom) return null;
  return (
    <Pressable
      {...props}
      accessibilityLabel={labels.scrollToBottom}
      accessibilityRole="button"
      onPress={scrollToBottom}
      ref={ref}
      style={[
        styles.scrollButton,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing[3],
        },
        style,
      ]}
    >
      <Text
        style={[
          theme.typography.scale.caption,
          { color: theme.colors.foreground },
        ]}
      >
        {labels.scrollToBottom}
      </Text>
    </Pressable>
  );
}
ConversationScrollButton.displayName = "ConversationScrollButton";

/** Explicit text status shown while the assistant response is streaming. */
function ConversationLoading({
  ref,
  style,
  ...props
}: ConversationLoadingProps) {
  const theme = useTheme();
  const { isStreaming, labels, messages } = useConversation();
  const lastMessage = messages.at(-1);
  if (!isStreaming || lastMessage?.role !== "assistant") return null;
  return (
    <View {...props} ref={ref} style={style}>
      <Text
        accessibilityLiveRegion="polite"
        style={[
          theme.typography.scale.caption,
          { color: theme.colors.mutedForeground },
        ]}
      >
        {labels.assistantTyping}
      </Text>
    </View>
  );
}
ConversationLoading.displayName = "ConversationLoading";

export {
  ConversationEmpty,
  ConversationHeader,
  ConversationLoading,
  ConversationMessages,
  ConversationScrollButton,
  ConversationSuggestions,
  ConversationThread,
  ConversationTitle,
};
