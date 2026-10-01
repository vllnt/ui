import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
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

/** Renders a thread whose message list wraps `children`. */
const renderThread = (
  props: Partial<ComponentProps<typeof ConversationThread>>,
  children?: ReactNode,
) =>
  render(
    <ConversationThread messages={mockMessages} {...props}>
      <ConversationMessages>{children}</ConversationMessages>
    </ConversationThread>,
  );

const suggestions = (items: string[]) => (
  <ConversationEmpty>
    <ConversationSuggestions suggestions={items} />
  </ConversationEmpty>
);

describe("ConversationThread", () => {
  it("renders user and assistant messages in an accessible log without thinking blocks", () => {
    renderThread({});
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    expect(screen.queryByText("Thinking")).not.toBeInTheDocument();
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveAttribute("aria-label", "Conversation messages");
  });

  it("applies custom className to root and renders ConversationHeader and ConversationTitle", () => {
    const { container } = render(
      <ConversationThread className="custom-class" messages={[]}>
        <ConversationHeader>
          <ConversationTitle>My Chat</ConversationTitle>
        </ConversationHeader>
        <ConversationMessages />
      </ConversationThread>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(screen.getByText("My Chat")).toBeInTheDocument();
  });

  it("renders ConversationEmpty children only when there are no messages", () => {
    const empty = (
      <ConversationEmpty>
        <p>No messages yet</p>
      </ConversationEmpty>
    );
    const { unmount } = renderThread({ messages: [] }, empty);
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
    unmount();
    renderThread({}, empty);
    expect(screen.queryByText("No messages yet")).not.toBeInTheDocument();
  });

  it("shows ConversationLoading when streaming and last message is assistant", () => {
    renderThread({ isStreaming: true }, <ConversationLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it.each([
    ["not streaming", { isStreaming: false }],
    [
      "streaming but last message is user",
      {
        isStreaming: true,
        messages: [{ content: "Hello", id: "1", role: "user" as const }],
      },
    ],
  ])("hides ConversationLoading when %s", (_name, props) => {
    renderThread(props, <ConversationLoading />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders ThinkingBlock for assistant messages with thinking content", () => {
    renderThread({
      messages: [
        {
          content: "My answer",
          id: "1",
          role: "assistant",
          thinking: "Let me think...",
        },
      ],
    });
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });

  it("renders tool call names", () => {
    renderThread({
      messages: [
        {
          content: "Done",
          id: "1",
          role: "assistant",
          toolCalls: [{ id: "tc1", name: "search_web" }],
        },
      ],
    });
    expect(screen.getByText("search_web")).toBeInTheDocument();
  });

  it("renders one retry and feedback set for the assistant message and reports its id", () => {
    const onRetry = vi.fn();
    const onFeedback = vi.fn();
    renderThread({ onFeedback, onRetry });
    expect(
      screen.getAllByRole("button", { name: "Retry message" }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "Positive feedback" }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "Negative feedback" }),
    ).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Retry message" }));
    expect(onRetry).toHaveBeenCalledWith("2");
    fireEvent.click(screen.getByRole("button", { name: "Positive feedback" }));
    expect(onFeedback).toHaveBeenCalledWith("2", "positive");
    fireEvent.click(screen.getByRole("button", { name: "Negative feedback" }));
    expect(onFeedback).toHaveBeenCalledWith("2", "negative");
  });

  it("renders suggestion chips in empty state and calls onSend on click", () => {
    const onSend = vi.fn();
    renderThread({ messages: [], onSend }, suggestions(["Hello!", "Help me"]));
    expect(screen.getByRole("button", { name: "Help me" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hello!" }));
    expect(onSend).toHaveBeenCalledWith("Hello!");
  });

  it("renders no suggestion chips when suggestions array is empty", () => {
    renderThread({ messages: [] }, suggestions([]));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the scroll button only after scrolling up", () => {
    renderThread({}, <ConversationScrollButton />);
    expect(
      screen.queryByRole("button", { name: "Scroll to bottom" }),
    ).not.toBeInTheDocument();
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

  it("throws when compound component used outside ConversationThread", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(vi.fn());
    expect(() => render(<ConversationMessages />)).toThrow(
      "ConversationThread compound components must be used within <ConversationThread>",
    );
    consoleError.mockRestore();
  });
});

describe("ConversationMessages keyboard access", () => {
  it("lets keyboard users focus the scrolling message log", () => {
    renderThread({});
    expect(
      screen.getByRole("log", { name: "Conversation messages" }),
    ).toHaveAttribute("tabindex", "0");
  });
});
