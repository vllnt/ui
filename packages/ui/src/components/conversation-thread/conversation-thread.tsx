"use client";

import {
  createContext,
  forwardRef,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ArrowDown, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";

import { cn } from "../../lib/utils";
import { ThinkingBlock } from "../thinking-block";

/** A single tool call made by the assistant. */
export type ToolCall = {
  id: string;
  input?: Record<string, unknown>;
  name: string;
  result?: string;
};

/** A single message in the conversation. */
export type ConversationMessage = {
  content: string;
  id: string;
  /** Whether the assistant still streams this individual message. */
  isStreaming?: boolean;
  role: "assistant" | "user";
  /** AI reasoning/thinking content. The component renders this via ThinkingBlock. */
  thinking?: string;
  toolCalls?: ToolCall[];
};

export type ConversationThreadProps = {
  children?: ReactNode;
  className?: string;
  /** Whether the assistant generates a response. */
  isStreaming?: boolean;
  messages: ConversationMessage[];
  onFeedback?: (messageId: string, feedback: "negative" | "positive") => void;
  onRetry?: (messageId: string) => void;
  /** Calls onSend with the suggestion text after the user clicks a ConversationSuggestions chip. */
  onSend?: (message: string) => void;
};

export type ConversationHeaderProps = {
  children?: ReactNode;
  className?: string;
};

export type ConversationTitleProps = {
  children?: ReactNode;
  className?: string;
};

export type ConversationMessagesProps = {
  /** Overlay children: ConversationEmpty, ConversationScrollButton, ConversationLoading. */
  children?: ReactNode;
  className?: string;
};

export type ConversationEmptyProps = {
  children?: ReactNode;
  className?: string;
};

export type ConversationSuggestionsProps = {
  className?: string;
  suggestions?: string[];
};

export type ConversationScrollButtonProps = {
  className?: string;
};

export type ConversationLoadingProps = {
  className?: string;
};

// ---- Context ----

type ConversationThreadContextValue = {
  handleScroll: () => void;
  isAtBottom: boolean;
  isStreaming: boolean;
  messages: ConversationMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onFeedback?: (messageId: string, feedback: "negative" | "positive") => void;
  onRetry?: (messageId: string) => void;
  onSend?: (message: string) => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
};

const ConversationThreadContext =
  createContext<ConversationThreadContextValue | null>(null);

function useConversationThreadContext(): ConversationThreadContextValue {
  const ctx = useContext(ConversationThreadContext);
  if (!ctx) {
    throw new Error(
      "ConversationThread compound components must be used within <ConversationThread>",
    );
  }
  return ctx;
}

// ---- Internal message item ----

type MessageActionsProps = {
  messageId: string;
};

function MessageActions({ messageId }: MessageActionsProps) {
  const { onFeedback, onRetry } = useConversationThreadContext();

  return (
    <div className="mt-2 flex items-center gap-1">
      {onRetry ? (
        <button
          aria-label="Retry message"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => {
            onRetry(messageId);
          }}
          type="button"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      ) : null}
      {onFeedback ? (
        <>
          <button
            aria-label="Positive feedback"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => {
              onFeedback(messageId, "positive");
            }}
            type="button"
          >
            <ThumbsUp className="h-3 w-3" />
          </button>
          <button
            aria-label="Negative feedback"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => {
              onFeedback(messageId, "negative");
            }}
            type="button"
          >
            <ThumbsDown className="h-3 w-3" />
          </button>
        </>
      ) : null}
    </div>
  );
}

type MessageItemProps = {
  message: ConversationMessage;
};

function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "mb-4 flex gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground",
        )}
      >
        {!isUser && message.thinking ? (
          <ThinkingBlock
            isStreaming={message.isStreaming}
            thinking={message.thinking}
          />
        ) : null}
        {message.toolCalls && message.toolCalls.length > 0 ? (
          <ul
            aria-label="Tool calls"
            className="mb-2 flex flex-col gap-1 text-xs text-muted-foreground"
          >
            {message.toolCalls.map((toolCall) => (
              <li className="font-mono" key={toolCall.id}>
                {toolCall.name}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {isUser ? null : <MessageActions messageId={message.id} />}
      </div>
    </div>
  );
}

// ---- Scroll hook ----

function useConversationScroll(
  messages: ConversationMessage[],
  isStreaming: boolean,
) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    const element = messagesEndRef.current;
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scrollToBottomInstant = useCallback(() => {
    const element = messagesEndRef.current;
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { clientHeight, scrollHeight, scrollTop } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight <= 100;
    isAtBottomRef.current = nearBottom;
    setIsAtBottom(nearBottom);
  }, []);

  useEffect(() => {
    if (!isAtBottomRef.current) return;
    scrollToBottomInstant();
  }, [messages, scrollToBottomInstant]);

  useEffect(() => {
    if (!isStreaming || !isAtBottomRef.current) return;
    scrollToBottomInstant();
  }, [isStreaming, scrollToBottomInstant]);

  return {
    handleScroll,
    isAtBottom,
    messagesEndRef,
    scrollContainerRef,
    scrollToBottom,
  };
}

// ---- Root ----

/**
 * Root provider for the ConversationThread compound component family.
 *
 * @example
 * ```tsx
 * <ConversationThread messages={messages} isStreaming={isStreaming} onSend={handleSend}>
 *   <ConversationHeader><ConversationTitle>Chat</ConversationTitle></ConversationHeader>
 *   <ConversationMessages>
 *     <ConversationEmpty>
 *       <ConversationSuggestions suggestions={["Hello!", "Help me with..."]} />
 *     </ConversationEmpty>
 *     <ConversationScrollButton />
 *     <ConversationLoading />
 *   </ConversationMessages>
 * </ConversationThread>
 * ```
 */
export const ConversationThread = forwardRef<
  HTMLDivElement,
  ConversationThreadProps
>(
  (
    {
      children,
      className,
      isStreaming = false,
      messages,
      onFeedback,
      onRetry,
      onSend,
    },
    reference,
  ) => {
    const {
      handleScroll,
      isAtBottom,
      messagesEndRef,
      scrollContainerRef,
      scrollToBottom,
    } = useConversationScroll(messages, isStreaming);

    const contextValue = useMemo<ConversationThreadContextValue>(
      () => ({
        handleScroll,
        isAtBottom,
        isStreaming,
        messages,
        messagesEndRef,
        onFeedback,
        onRetry,
        onSend,
        scrollContainerRef,
        scrollToBottom,
      }),
      [
        handleScroll,
        isAtBottom,
        isStreaming,
        messages,
        messagesEndRef,
        onFeedback,
        onRetry,
        onSend,
        scrollContainerRef,
        scrollToBottom,
      ],
    );

    return (
      <ConversationThreadContext.Provider value={contextValue}>
        <div
          className={cn("flex h-full flex-col overflow-hidden", className)}
          ref={reference}
        >
          {children}
        </div>
      </ConversationThreadContext.Provider>
    );
  },
);
ConversationThread.displayName = "ConversationThread";

// ---- Compound components ----

/** Optional header slot, rendered above the message list. */
export const ConversationHeader = forwardRef<
  HTMLDivElement,
  ConversationHeaderProps
>(({ children, className }, reference) => {
  return (
    <div
      className={cn("flex shrink-0 items-center border-b px-4 py-3", className)}
      ref={reference}
    >
      {children}
    </div>
  );
});
ConversationHeader.displayName = "ConversationHeader";

/** Title text for use inside ConversationHeader. */
export const ConversationTitle = forwardRef<
  HTMLHeadingElement,
  ConversationTitleProps
>(({ children, className }, reference) => {
  return (
    <h2
      className={cn("text-sm font-semibold leading-none", className)}
      ref={reference}
    >
      {children}
    </h2>
  );
});
ConversationTitle.displayName = "ConversationTitle";

/**
 * Scrollable message list container. Renders messages from context.
 * Pass ConversationEmpty, ConversationScrollButton, and ConversationLoading as children —
 * the component renders these as absolute overlays that read state from context.
 */
export const ConversationMessages = forwardRef<
  HTMLDivElement,
  ConversationMessagesProps
>(({ children, className }, reference) => {
  const { handleScroll, messages, messagesEndRef, scrollContainerRef } =
    useConversationThreadContext();

  return (
    <div className={cn("relative min-h-0 flex-1", className)} ref={reference}>
      <div
        aria-label="Conversation messages"
        aria-live="polite"
        className="absolute inset-0 overflow-y-auto"
        onScroll={handleScroll}
        ref={scrollContainerRef}
        role="log"
      >
        <div className="flex flex-col p-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div aria-hidden="true" ref={messagesEndRef} />
        </div>
      </div>
      {children}
    </div>
  );
});
ConversationMessages.displayName = "ConversationMessages";

/**
 * Shown when the message list is empty. Hides automatically once messages exist.
 * Renders as a centered overlay — pass ConversationSuggestions or custom content as children.
 */
export const ConversationEmpty = forwardRef<
  HTMLDivElement,
  ConversationEmptyProps
>(({ children, className }, reference) => {
  const { messages } = useConversationThreadContext();

  if (messages.length > 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 p-8",
        className,
      )}
      ref={reference}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        {children}
      </div>
    </div>
  );
});
ConversationEmpty.displayName = "ConversationEmpty";

/** Suggested prompt chips displayed in the empty state. Calls onSend when clicked. */
export const ConversationSuggestions = forwardRef<
  HTMLDivElement,
  ConversationSuggestionsProps
>(({ className, suggestions = [] }, reference) => {
  const { onSend } = useConversationThreadContext();

  return (
    <div
      className={cn("flex flex-wrap justify-center gap-2", className)}
      ref={reference}
    >
      {suggestions.map((suggestion) => (
        <button
          className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
          key={suggestion}
          onClick={() => onSend?.(suggestion)}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
});
ConversationSuggestions.displayName = "ConversationSuggestions";

/** Floating button that appears when the user scrolls up, to jump back to the bottom. */
export const ConversationScrollButton = forwardRef<
  HTMLButtonElement,
  ConversationScrollButtonProps
>(({ className }, reference) => {
  const { isAtBottom, scrollToBottom } = useConversationThreadContext();

  if (isAtBottom) return null;

  return (
    <button
      aria-label="Scroll to bottom"
      className={cn(
        "absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-md transition-colors hover:bg-muted",
        className,
      )}
      onClick={scrollToBottom}
      ref={reference}
      type="button"
    >
      <ArrowDown className="h-4 w-4" />
    </button>
  );
});
ConversationScrollButton.displayName = "ConversationScrollButton";

/**
 * Typing indicator shown while the assistant is streaming a response.
 * Visible when isStreaming is true and the last message role is "assistant".
 */
export const ConversationLoading = forwardRef<
  HTMLDivElement,
  ConversationLoadingProps
>(({ className }, reference) => {
  const { isStreaming, messages } = useConversationThreadContext();
  const lastMessage = messages.at(-1);

  if (!isStreaming || lastMessage?.role !== "assistant") return null;

  return (
    <div
      aria-label="Assistant is typing"
      className={cn(
        "absolute bottom-4 left-4 flex items-center gap-1",
        className,
      )}
      ref={reference}
      role="status"
    >
      <span
        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
        style={{ animationDelay: "-0.3s" }}
      />
      <span
        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
        style={{ animationDelay: "-0.15s" }}
      />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  );
});
ConversationLoading.displayName = "ConversationLoading";
