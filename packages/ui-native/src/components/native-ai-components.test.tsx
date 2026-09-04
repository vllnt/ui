import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import {
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDetailText,
  AgentStepProgress,
  AgentStepTitle,
} from "./agent-activity/agent-activity";
import { AIChatInput } from "./ai-chat-input/ai-chat-input";
import { ChainOfThought } from "./chain-of-thought/chain-of-thought";
import {
  ConversationEmpty,
  ConversationLoading,
  ConversationMessages,
  ConversationSuggestions,
  ConversationThread,
} from "./conversation-thread/conversation-thread";
import { ModelSelector } from "./model-selector/model-selector";
import { PromptInput } from "./prompt-input/prompt-input";
import { Reasoning } from "./reasoning/reasoning";
import { ThinkingBlock } from "./thinking-block/thinking-block";

const thinkingLabels = {
  collapse: "Hide thinking",
  expand: "Show thinking",
  streaming: "Thinking now",
  thinking: "Thinking",
};

const conversationLabels = {
  assistantMessage: "Assistant message",
  assistantTyping: "Assistant is typing",
  negativeFeedback: "Not helpful",
  positiveFeedback: "Helpful",
  retry: "Try again",
  scrollToBottom: "Read newest message",
  toolCalls: "Tools used",
  userMessage: "Your message",
};

const activityLabels = {
  activity: "Agent activity",
  collapse: "Hide details",
  elapsed: "Elapsed time",
  expand: "Show details",
  status: {
    completed: "Completed",
    error: "Failed",
    idle: "Idle",
    pending: "Pending",
    running: "Running",
    skipped: "Skipped",
    unavailable: "Service unavailable",
  },
};

describe("native AI components", () => {
  it("submits uncontrolled chat and prompt values with native actions", () => {
    const onChatSubmit = jest.fn();
    const onPromptSubmit = jest.fn();
    render(
      <>
        <AIChatInput
          inputLabel="Chat message"
          onSubmit={onChatSubmit}
          submitLabel="Send chat"
          testID="chat-composer"
        />
        <PromptInput
          inputLabel="Prompt"
          onSubmit={onPromptSubmit}
          submitLabel="Send prompt"
          testID="prompt-composer"
        />
      </>,
    );

    fireEvent.changeText(screen.getByLabelText("Chat message"), "Hello");
    fireEvent.press(screen.getByRole("button", { name: "Send chat" }));
    fireEvent.changeText(screen.getByLabelText("Prompt"), "Plan this");
    fireEvent(screen.getByLabelText("Prompt"), "submitEditing");

    expect(screen.getByTestId("chat-composer")).toBeOnTheScreen();
    expect(screen.getByTestId("prompt-composer")).toBeOnTheScreen();
    expect(onChatSubmit).toHaveBeenCalledWith("Hello");
    expect(onPromptSubmit).toHaveBeenCalledWith("Plan this");
    expect(screen.getByLabelText("Chat message")).toHaveProp("value", "");
    expect(screen.getByLabelText("Prompt")).toHaveProp("value", "");
  });

  it("exposes unavailable services and blocks unavailable actions", () => {
    const onChatSubmit = jest.fn();
    const onModelOpenChange = jest.fn();
    const onPromptSubmit = jest.fn();
    const onSelectModel = jest.fn();
    render(
      <>
        <AIChatInput
          defaultValue="Hello"
          inputLabel="Chat message"
          onSubmit={onChatSubmit}
          serviceState={{ message: "Chat is offline", status: "unavailable" }}
          submitLabel="Send chat"
        />
        <PromptInput
          defaultValue="Plan"
          inputLabel="Prompt"
          onSubmit={onPromptSubmit}
          serviceState={{
            message: "Prompts are offline",
            status: "unavailable",
          }}
          submitLabel="Send prompt"
        />
        <ModelSelector
          defaultOpen
          labels={{
            close: "Close models",
            description: "Choose one model",
            noModels: "No matching models",
            search: "Search models",
            selected: "Selected",
            title: "Choose model",
            unavailable: "Unavailable",
          }}
          models={[
            {
              id: "provider/offline",
              name: "Offline model",
              serviceState: {
                message: "Provider maintenance",
                status: "unavailable",
              },
            },
          ]}
          onOpenChange={onModelOpenChange}
          onSelectModel={onSelectModel}
          testID="model-selector"
        />
      </>,
    );

    expect(screen.getByRole("button", { name: "Send chat" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send prompt" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Offline model" })).toBeDisabled();

    expect(screen.getByTestId("model-selector")).toBeOnTheScreen();
    expect(screen.getByText("Chat is offline")).toBeOnTheScreen();
    expect(screen.getByText("Prompts are offline")).toBeOnTheScreen();
    expect(
      screen.getByText("Unavailable: Provider maintenance"),
    ).toBeOnTheScreen();
    expect(onChatSubmit).not.toHaveBeenCalled();
    expect(onPromptSubmit).not.toHaveBeenCalled();
    expect(onSelectModel).not.toHaveBeenCalled();

    fireEvent(
      screen.UNSAFE_getByProps({ accessibilityViewIsModal: true }),
      "accessibilityEscape",
    );
    expect(onModelOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders stable ordered reasoning and controlled disclosures", () => {
    const onReasoningOpenChange = jest.fn();
    const onThinkingExpandedChange = jest.fn();
    render(
      <>
        <ChainOfThought
          statusLabels={{
            active: "Active",
            complete: "Complete",
            error: "Error",
            pending: "Pending",
          }}
          steps={[
            { id: "read", status: "complete", title: "Read request" },
            { id: "answer", status: "active", title: "Draft answer" },
          ]}
        />
        <Reasoning
          labels={{
            collapse: "Hide reasoning",
            expand: "Show reasoning",
            reasoned: "Reasoned",
            reasoning: "Reasoning",
          }}
          onOpenChange={onReasoningOpenChange}
          open={false}
          steps={[{ id: "step", text: "Check constraints" }]}
        />
        <ThinkingBlock
          expanded={false}
          labels={thinkingLabels}
          onExpandedChange={onThinkingExpandedChange}
          thinking="Private trace"
        />
      </>,
    );

    expect(screen.getByLabelText("Read request, Complete")).toBeOnTheScreen();
    expect(screen.getByLabelText("Draft answer, Active")).toBeBusy();
    fireEvent.press(screen.getByRole("button", { name: "Show reasoning" }));
    fireEvent.press(screen.getByRole("button", { name: "Show thinking" }));
    expect(onReasoningOpenChange).toHaveBeenCalledWith(true);
    expect(onThinkingExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Check constraints")).not.toBeOnTheScreen();
    expect(screen.queryByText("Private trace")).not.toBeOnTheScreen();
  });

  it("preserves conversation scroll position while reading history", () => {
    render(
      <ConversationThread
        labels={conversationLabels}
        messages={[
          { content: "Older message", id: "assistant-1", role: "assistant" },
        ]}
        thinkingLabels={thinkingLabels}
      >
        <ConversationMessages />
      </ConversationThread>,
    );

    const messageList = screen.UNSAFE_getByProps({
      accessibilityLabel: "Assistant message",
      accessibilityRole: "list",
    });
    expect(messageList.props.onContentSizeChange).toEqual(expect.any(Function));
    fireEvent.scroll(messageList, {
      nativeEvent: {
        contentOffset: { x: 0, y: 0 },
        contentSize: { height: 1000, width: 320 },
        layoutMeasurement: { height: 320, width: 320 },
      },
    });

    expect(
      screen.UNSAFE_getByProps({
        accessibilityLabel: "Assistant message",
        accessibilityRole: "list",
      }).props.onContentSizeChange,
    ).toBeUndefined();
  });

  it("renders conversation and agent activity compound parts", () => {
    const onSend = jest.fn();
    render(
      <>
        <ConversationThread
          isStreaming
          labels={conversationLabels}
          messages={[
            {
              content: "Working",
              id: "assistant-1",
              isStreaming: true,
              role: "assistant",
            },
          ]}
          onSend={onSend}
          thinkingLabels={thinkingLabels}
        >
          <ConversationMessages>
            <ConversationLoading />
          </ConversationMessages>
          <ConversationEmpty>
            <ConversationSuggestions
              suggestions={[
                { id: "hello", label: "Say hello", value: "Hello" },
              ]}
            />
          </ConversationEmpty>
        </ConversationThread>
        <ConversationThread
          labels={conversationLabels}
          messages={[]}
          onSend={onSend}
          thinkingLabels={thinkingLabels}
        >
          <ConversationMessages />
          <ConversationEmpty>
            <ConversationSuggestions
              suggestions={[
                { id: "hello", label: "Say hello", value: "Hello" },
              ]}
            />
          </ConversationEmpty>
        </ConversationThread>
        <AgentActivity labels={activityLabels} status="running">
          <AgentStep status="running">
            <AgentStepTitle>Call service</AgentStepTitle>
            <AgentStepProgress label="Service progress" value={50} />
            <AgentStepDetail>
              <AgentStepDetailText>Waiting for response</AgentStepDetailText>
            </AgentStepDetail>
          </AgentStep>
        </AgentActivity>
      </>,
    );

    expect(screen.getByText("Assistant is typing")).toBeOnTheScreen();
    expect(screen.getByLabelText("Service progress")).toHaveAccessibilityValue({
      max: 100,
      min: 0,
      now: 50,
    });
    fireEvent.press(screen.getByRole("button", { name: "Say hello" }));
    expect(onSend).toHaveBeenCalledWith("Hello");
    expect(screen.getByText("Waiting for response")).toBeOnTheScreen();
  });

  it("keeps caller content as native nodes without claiming rich text", () => {
    render(
      <Reasoning
        defaultOpen
        labels={{
          collapse: "Hide reasoning",
          expand: "Show reasoning",
          reasoned: "Reasoned",
          reasoning: "Reasoning",
        }}
      >
        <Text>Plain native content</Text>
      </Reasoning>,
    );

    expect(screen.getByText("Plain native content")).toBeOnTheScreen();
  });
});
