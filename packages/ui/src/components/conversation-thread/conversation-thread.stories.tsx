import type { Meta, StoryObj } from "@storybook/react-vite";

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

const sampleMessages: ConversationMessage[] = [
  {
    content: "What is the capital of France?",
    id: "1",
    role: "user",
  },
  {
    content: "The capital of France is Paris.",
    id: "2",
    role: "assistant",
    thinking: "The user asks about the capital of France. It is Paris.",
  },
];

const meta = {
  args: {
    messages: sampleMessages,
  },
  component: ConversationThread,
  decorators: [
    (Story) => (
      <div style={{ height: "500px", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  title: "AI/ConversationThread",
} satisfies Meta<typeof ConversationThread>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ConversationThread {...args}>
      <ConversationHeader>
        <ConversationTitle>Assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty />
        <ConversationScrollButton />
        <ConversationLoading />
      </ConversationMessages>
    </ConversationThread>
  ),
};

export const Empty: Story = {
  args: {
    messages: [],
  },
  render: (args) => (
    <ConversationThread {...args}>
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
    </ConversationThread>
  ),
};

export const Streaming: Story = {
  args: {
    isStreaming: true,
    messages: [
      {
        content: "Tell me a joke",
        id: "1",
        role: "user",
      },
      {
        content: "Why did the chicken cross the road?",
        id: "2",
        isStreaming: true,
        role: "assistant",
      },
    ],
  },
  render: (args) => (
    <ConversationThread {...args}>
      <ConversationHeader>
        <ConversationTitle>Assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty />
        <ConversationScrollButton />
        <ConversationLoading />
      </ConversationMessages>
    </ConversationThread>
  ),
};

export const ToolCalls: Story = {
  args: {
    messages: [
      {
        content: "Search for docs",
        id: "1",
        role: "user",
      },
      {
        content: "Here are the results:",
        id: "2",
        role: "assistant",
        toolCalls: [
          { id: "t1", input: { query: "auth" }, name: "search_docs" },
        ],
      },
    ],
  },
  render: (args) => (
    <ConversationThread {...args}>
      <ConversationHeader>
        <ConversationTitle>Assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty />
        <ConversationScrollButton />
        <ConversationLoading />
      </ConversationMessages>
    </ConversationThread>
  ),
};
