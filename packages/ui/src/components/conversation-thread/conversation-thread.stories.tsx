import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ConversationEmpty,
  ConversationHeader,
  ConversationLoading,
  ConversationMessages,
  ConversationScrollButton,
  ConversationSuggestions,
  ConversationThread,
  ConversationTitle,
  type ConversationMessage,
} from "./conversation-thread";

const sampleMessages: ConversationMessage[] = [
  {
    id: "user-1",
    role: "user",
    content: "Summarize the UI PR stack and call out blockers.",
  },
  {
    id: "assistant-1",
    role: "assistant",
    content:
      "I reconciled the stacked branches against main and queued the next merge in order.",
    thinking:
      "Check the PR states, confirm quality gates, then merge only the clean branches.",
    toolCalls: [
      {
        id: "tool-1",
        name: "gh_pr_checks",
        input: { pr: 149 },
      },
    ],
  },
];

const meta = {
  args: {
    messages: sampleMessages,
  },
  component: ConversationThread,
  title: "AI/ConversationThread",
} satisfies Meta<typeof ConversationThread>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultConversation() {
  return (
    <ConversationThread messages={sampleMessages}>
      <ConversationHeader>
        <ConversationTitle>Workspace assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty />
        <ConversationScrollButton />
        <ConversationLoading />
      </ConversationMessages>
    </ConversationThread>
  );
}

export const Default: Story = {
  render: () => <DefaultConversation />,
};

export const EmptyState: Story = {
  render: () => (
    <ConversationThread messages={[]}>
      <ConversationHeader>
        <ConversationTitle>Workspace assistant</ConversationTitle>
      </ConversationHeader>
      <ConversationMessages>
        <ConversationEmpty>
          <p className="text-sm text-muted-foreground">Start a conversation</p>
          <ConversationSuggestions
            suggestions={[
              "Review the failing CI job",
              "Compare these design options",
              "Write the release note",
            ]}
          />
        </ConversationEmpty>
      </ConversationMessages>
    </ConversationThread>
  ),
};

export const Streaming: Story = {
  render: () => {
    const [messages] = React.useState<ConversationMessage[]>([
      {
        id: "user-1",
        role: "user",
        content: "Draft the announcement post.",
      },
      {
        id: "assistant-1",
        role: "assistant",
        content: "I’m drafting a concise launch announcement",
        isStreaming: true,
      },
    ]);

    return (
      <ConversationThread isStreaming={true} messages={messages}>
        <ConversationHeader>
          <ConversationTitle>Workspace assistant</ConversationTitle>
        </ConversationHeader>
        <ConversationMessages>
          <ConversationEmpty />
          <ConversationScrollButton />
          <ConversationLoading />
        </ConversationMessages>
      </ConversationThread>
    );
  },
};
