import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ConversationEmpty,
  ConversationHeader,
  ConversationLoading,
  type ConversationMessage,
  ConversationMessages,
  ConversationScrollButton,
  ConversationSuggestions,
  ConversationThread,
  ConversationTitle,
} from "./conversation-thread";

const mockMessages: ConversationMessage[] = [
  { content: "Hello", id: "1", role: "user" },
  { content: "Hi there!", id: "2", role: "assistant" },
];

describe("ConversationThread", () => {
  describe("rendering", () => {
    it("renders with messages", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });

    it("applies custom className to root element", () => {
      const { container } = render(
        <ConversationThread className="custom-class" messages={[]}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders ConversationHeader and ConversationTitle", () => {
      render(
        <ConversationThread messages={[]}>
          <ConversationHeader>
            <ConversationTitle>My Chat</ConversationTitle>
          </ConversationHeader>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByText("My Chat")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("renders ConversationEmpty children when no messages", () => {
      render(
        <ConversationThread messages={[]}>
          <ConversationMessages>
            <ConversationEmpty>
              <p>No messages yet</p>
            </ConversationEmpty>
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(screen.getByText("No messages yet")).toBeInTheDocument();
    });

    it("hides ConversationEmpty when messages exist", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages>
            <ConversationEmpty>
              <p>No messages yet</p>
            </ConversationEmpty>
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(screen.queryByText("No messages yet")).not.toBeInTheDocument();
    });
  });

  describe("loading indicator", () => {
    it("shows ConversationLoading when streaming and last message is assistant", () => {
      const streamingMessages: ConversationMessage[] = [
        { content: "Hello", id: "1", role: "user" },
        { content: "Hi...", id: "2", role: "assistant" },
      ];

      render(
        <ConversationThread isStreaming messages={streamingMessages}>
          <ConversationMessages>
            <ConversationLoading />
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("hides ConversationLoading when not streaming", () => {
      render(
        <ConversationThread isStreaming={false} messages={mockMessages}>
          <ConversationMessages>
            <ConversationLoading />
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("hides ConversationLoading when streaming but last message is user", () => {
      const userLastMessages: ConversationMessage[] = [
        { content: "Hello", id: "1", role: "user" },
      ];

      render(
        <ConversationThread isStreaming messages={userLastMessages}>
          <ConversationMessages>
            <ConversationLoading />
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("message rendering", () => {
    it("renders user messages", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("renders assistant messages", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });

    it("renders ThinkingBlock for assistant messages with thinking content", () => {
      const messagesWithThinking: ConversationMessage[] = [
        {
          content: "My answer",
          id: "1",
          role: "assistant",
          thinking: "Let me think...",
        },
      ];

      render(
        <ConversationThread messages={messagesWithThinking}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByText("Thinking")).toBeInTheDocument();
    });

    it("does not render ThinkingBlock when thinking is absent", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.queryByText("Thinking")).not.toBeInTheDocument();
    });

    it("renders tool call names", () => {
      const messagesWithTools: ConversationMessage[] = [
        {
          content: "Done",
          id: "1",
          role: "assistant",
          toolCalls: [{ id: "tc1", name: "search_web" }],
        },
      ];

      render(
        <ConversationThread messages={messagesWithTools}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByText("search_web")).toBeInTheDocument();
    });

    it("renders retry and feedback buttons for assistant messages when callbacks provided", () => {
      const onRetry = vi.fn();
      const onFeedback = vi.fn();

      render(
        <ConversationThread
          messages={mockMessages}
          onFeedback={onFeedback}
          onRetry={onRetry}
        >
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(
        screen.getAllByRole("button", { name: "Retry message" }),
      ).toHaveLength(1);
      expect(
        screen.getAllByRole("button", { name: "Positive feedback" }),
      ).toHaveLength(1);
      expect(
        screen.getAllByRole("button", { name: "Negative feedback" }),
      ).toHaveLength(1);
    });

    it("calls onRetry with message id", () => {
      const onRetry = vi.fn();

      render(
        <ConversationThread messages={mockMessages} onRetry={onRetry}>
          <ConversationMessages />
        </ConversationThread>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Retry message" }));
      expect(onRetry).toHaveBeenCalledWith("2");
    });

    it("calls onFeedback with message id and sentiment", () => {
      const onFeedback = vi.fn();

      render(
        <ConversationThread messages={mockMessages} onFeedback={onFeedback}>
          <ConversationMessages />
        </ConversationThread>,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Positive feedback" }),
      );
      expect(onFeedback).toHaveBeenCalledWith("2", "positive");

      fireEvent.click(
        screen.getByRole("button", { name: "Negative feedback" }),
      );
      expect(onFeedback).toHaveBeenCalledWith("2", "negative");
    });
  });

  describe("suggestions", () => {
    it("renders suggestion chips in empty state", () => {
      render(
        <ConversationThread messages={[]}>
          <ConversationMessages>
            <ConversationEmpty>
              <ConversationSuggestions suggestions={["Hello!", "Help me"]} />
            </ConversationEmpty>
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(
        screen.getByRole("button", { name: "Hello!" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Help me" }),
      ).toBeInTheDocument();
    });

    it("calls onSend when a suggestion is clicked", () => {
      const onSend = vi.fn();

      render(
        <ConversationThread messages={[]} onSend={onSend}>
          <ConversationMessages>
            <ConversationEmpty>
              <ConversationSuggestions suggestions={["Hello!", "Help me"]} />
            </ConversationEmpty>
          </ConversationMessages>
        </ConversationThread>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Hello!" }));
      expect(onSend).toHaveBeenCalledWith("Hello!");
    });

    it("renders nothing when suggestions array is empty", () => {
      render(
        <ConversationThread messages={[]}>
          <ConversationMessages>
            <ConversationEmpty>
              <ConversationSuggestions suggestions={[]} />
            </ConversationEmpty>
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("scroll button", () => {
    it("does not show scroll button when at bottom (initial state)", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages>
            <ConversationScrollButton />
          </ConversationMessages>
        </ConversationThread>,
      );

      expect(
        screen.queryByRole("button", { name: "Scroll to bottom" }),
      ).not.toBeInTheDocument();
    });

    it("shows scroll button after scrolling up", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages>
            <ConversationScrollButton />
          </ConversationMessages>
        </ConversationThread>,
      );

      const log = screen.getByRole("log");

      Object.defineProperty(log, "scrollHeight", {
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(log, "scrollTop", { configurable: true, value: 0 });
      Object.defineProperty(log, "clientHeight", {
        configurable: true,
        value: 300,
      });

      fireEvent.scroll(log);

      expect(
        screen.getByRole("button", { name: "Scroll to bottom" }),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("message list has role=log", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByRole("log")).toBeInTheDocument();
    });

    it("message list has aria-live=polite", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByRole("log")).toHaveAttribute("aria-live", "polite");
    });

    it("message list has aria-label", () => {
      render(
        <ConversationThread messages={mockMessages}>
          <ConversationMessages />
        </ConversationThread>,
      );

      expect(screen.getByRole("log")).toHaveAttribute(
        "aria-label",
        "Conversation messages",
      );
    });
  });

  describe("context guard", () => {
    it("throws when compound component used outside ConversationThread", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(vi.fn());

      expect(() => render(<ConversationMessages />)).toThrow(
        "ConversationThread compound components must be used within <ConversationThread>",
      );

      consoleError.mockRestore();
    });
  });
});
