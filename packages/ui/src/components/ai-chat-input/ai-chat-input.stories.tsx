import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkles } from "lucide-react";

import { Badge } from "../badge";
import { AIChatInput } from "./ai-chat-input";

const meta = {
  component: AIChatInput,
  title: "AI/ChatInput",
} satisfies Meta<typeof AIChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState(
      "Draft a release note for the latest accessibility fixes.",
    );

    return (
      <div className="max-w-2xl">
        <AIChatInput
          helperText="Shift + Enter adds a new line"
          onSubmit={(event) => {
            event.preventDefault();
          }}
          onValueChange={setValue}
          status="2 files attached"
          toolbar={<Badge variant="secondary">Repo context</Badge>}
          value={value}
        />
      </div>
    );
  },
};

export const Submitting: Story = {
  render: () => (
    <div className="max-w-2xl">
      <AIChatInput
        helperText="The assistant is generating a response"
        isSubmitting={true}
        status="Streaming to workspace"
        submitLabel="Sending"
        toolbar={
          <Badge className="gap-1" variant="secondary">
            <Sparkles className="h-3 w-3" />
            Deep research mode
          </Badge>
        }
        value="Compare these two migration plans and recommend the safer option."
      />
    </div>
  ),
};
