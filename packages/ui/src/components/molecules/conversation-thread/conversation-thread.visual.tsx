import { test, expect } from "@playwright/experimental-ct-react";

import {
  ConversationThread,
  ConversationHeader,
  ConversationTitle,
  ConversationMessages,
  ConversationEmpty,
  ConversationSuggestions,
  ConversationScrollButton,
  ConversationLoading,
  type ConversationMessage,
} from "./conversation-thread";

test("visual - empty state with suggestions", async ({ mount, page }) => {
  const component = await mount(
    <ConversationThread messages={[]}>
      <ConversationHeader>
        <ConversationTitle>Assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty>
          <p className="text-muted-foreground text-sm">Start a conversation</p>
          <ConversationSuggestions
            suggestions={["Hello!", "Help me with..."]}
          />
        </ConversationEmpty>
      </ConversationMessages>
    </ConversationThread>,
  );

  await expect(component).toHaveScreenshot();
});

test("visual - with messages", async ({ mount, page }) => {
  const messages: ConversationMessage[] = [
    {
      id: "1",
      role: "user",
      content: "What is the capital of France?",
    },
    {
      id: "2",
      role: "assistant",
      content: "The capital of France is Paris.",
      thinking: "The user asks about the capital of France. It is Paris.",
    },
  ];

  const component = await mount(
    <ConversationThread messages={messages}>
      <ConversationHeader>
        <ConversationTitle>Assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty />
        <ConversationScrollButton />
        <ConversationLoading />
      </ConversationMessages>
    </ConversationThread>,
  );

  await expect(component).toHaveScreenshot();
});

test("visual - streaming state", async ({ mount, page }) => {
  const messages: ConversationMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Tell me a joke",
    },
    {
      id: "2",
      role: "assistant",
      content: "Why did the chicken cross the road?",
      isStreaming: true,
    },
  ];

  const component = await mount(
    <ConversationThread messages={messages} isStreaming={true}>
      <ConversationHeader>
        <ConversationTitle>Assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty />
        <ConversationScrollButton />
        <ConversationLoading />
      </ConversationMessages>
    </ConversationThread>,
  );

  await expect(component).toHaveScreenshot();
});

test("visual - tool calls", async ({ mount, page }) => {
  const messages: ConversationMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Search for docs",
    },
    {
      id: "2",
      role: "assistant",
      content: "Here are the results:",
      toolCalls: [
        { id: "t1", name: "search_docs", input: { query: "auth" } },
      ],
    },
  ];

  const component = await mount(
    <ConversationThread messages={messages}>
      <ConversationHeader>
        <ConversationTitle>Assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty />
        <ConversationScrollButton />
        <ConversationLoading />
      </ConversationMessages>
    </ConversationThread>,
  );

  await expect(component).toHaveScreenshot();
});
