import { act, fireEvent, screen } from "@testing-library/react-native";

import {
  AgentActivity,
  AgentStep,
  AgentStepDuration,
  AgentStepTitle,
} from "../components/atoms/agent-activity/agent-activity";
import { SimpleTerminal } from "../components/atoms/terminal/terminal";
import {
  AIArtifact,
  AIArtifactEditButton,
  AIArtifactToolbar,
} from "../components/molecules/ai-artifact/ai-artifact";
import {
  ConversationHeader,
  ConversationMessages,
  ConversationScrollButton,
  ConversationThread,
  ConversationTitle,
} from "../components/molecules/conversation-thread/conversation-thread";
import {
  ProgressTracker,
  ProgressTrackerBadge,
  ProgressTrackerStat,
  ProgressTrackerStats,
} from "../components/organisms/progress-tracker/progress-tracker";

import { renderThemed } from "./test-utils";

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

const thinkingLabels = {
  collapse: "Hide thinking",
  expand: "Show thinking",
  streaming: "Thinking now",
  thinking: "Thinking",
};

const progressLabels = {
  completedModules: (completed: number, total: number) =>
    `${completed} of ${total} modules`,
  currentLesson: (lesson: string) => `Current ${lesson}`,
  exercises: "Exercises",
  lessons: "Lessons",
  modules: "Modules",
  momentum: "Momentum",
  overallProgress: "Overall progress",
  progressPercent: (percent: number) => `${percent}% complete`,
  status: {
    available: "Available",
    completed: "Completed",
    "in-progress": "In progress",
    locked: "Locked",
  },
  streak: (days: number) => `${days} day streak`,
};

const copyLabels = {
  copied: "Copied",
  copy: "Copy commands",
  unavailable: "Unavailable",
};

const transcript = [
  "# Install dependencies",
  "$ pnpm install",
  "Packages: +12",
  "$ pnpm test",
].join("\n");

const scrolledAway = {
  nativeEvent: {
    contentOffset: { x: 0, y: 0 },
    contentSize: { height: 1000, width: 320 },
    layoutMeasurement: { height: 320, width: 320 },
  },
};

const scrolledToEnd = {
  nativeEvent: {
    ...scrolledAway.nativeEvent,
    contentOffset: { x: 0, y: 680 },
  },
};

it("renders an agent step duration next to the step title", () => {
  renderThemed(
    <AgentActivity labels={activityLabels} status="completed">
      <AgentStep status="completed">
        <AgentStepTitle>Call service</AgentStepTitle>
        <AgentStepDuration style={{ opacity: 0.5 }}>1.2 s</AgentStepDuration>
      </AgentStep>
    </AgentActivity>,
  );

  expect(screen.getByText("Call service")).toBeOnTheScreen();
  expect(screen.getByText("1.2 s")).toBeOnTheScreen();
  expect(screen.getByText("1.2 s")).toHaveStyle({ opacity: 0.5 });
});

it("calls the artifact edit handler from the edit action", () => {
  const onEdit = jest.fn();
  renderThemed(
    <AIArtifact onEdit={onEdit} title="Profile card">
      <AIArtifactToolbar>
        <AIArtifactEditButton />
      </AIArtifactToolbar>
    </AIArtifact>,
  );

  fireEvent.press(screen.getByRole("button", { name: "Edit" }));

  expect(onEdit).toHaveBeenCalledTimes(1);
});

it("labels the edit action and runs a press-only handler", () => {
  const onPress = jest.fn();
  renderThemed(
    <AIArtifact labels={{ edit: "Modify" }} title="Profile card">
      <AIArtifactEditButton onPress={onPress} />
    </AIArtifact>,
  );

  fireEvent.press(screen.getByRole("button", { name: "Modify" }));

  expect(onPress).toHaveBeenCalledTimes(1);
});

it("hides the edit action when nothing handles it", () => {
  renderThemed(
    <AIArtifact title="Profile card">
      <AIArtifactEditButton />
    </AIArtifact>,
  );

  expect(screen.getByText("Profile card")).toBeOnTheScreen();
  expect(screen.queryByRole("button")).toBeNull();
});

it("renders the conversation header with an accessible title", () => {
  renderThemed(
    <ConversationThread
      labels={conversationLabels}
      messages={[]}
      thinkingLabels={thinkingLabels}
    >
      <ConversationHeader testID="header">
        <ConversationTitle>Support chat</ConversationTitle>
      </ConversationHeader>
    </ConversationThread>,
  );

  expect(screen.getByTestId("header")).toContainElement(
    screen.getByRole("header", { name: "Support chat" }),
  );
});

it("offers the scroll button only while the list is away from its end", () => {
  renderThemed(
    <ConversationThread
      labels={conversationLabels}
      messages={[
        { content: "Older message", id: "assistant-1", role: "assistant" },
      ]}
      thinkingLabels={thinkingLabels}
    >
      <ConversationMessages />
      <ConversationScrollButton />
    </ConversationThread>,
  );
  const newest = { name: "Read newest message" };
  expect(screen.queryByRole("button", newest)).toBeNull();

  const list = screen.UNSAFE_getByProps({ accessibilityRole: "list" });
  fireEvent.scroll(list, scrolledAway);
  expect(screen.getByRole("button", newest)).toBeOnTheScreen();

  fireEvent.scroll(list, scrolledToEnd);
  expect(screen.queryByRole("button", newest)).toBeNull();
});

it("renders progress tracker stats and badges", () => {
  renderThemed(
    <ProgressTracker
      labels={progressLabels}
      overallProgress={50}
      title="Course"
    >
      <ProgressTrackerStats testID="stats">
        <ProgressTrackerStat label="Lessons" value="3/10" />
        <ProgressTrackerStat label="Streak" value={4} />
      </ProgressTrackerStats>
      <ProgressTrackerBadge testID="badge">Beginner</ProgressTrackerBadge>
    </ProgressTracker>,
  );
  const stats = screen.getByTestId("stats");

  for (const text of ["Lessons", "3/10", "Streak", "4"])
    expect(stats).toContainElement(screen.getByText(text));
  expect(screen.getByTestId("badge")).toContainElement(
    screen.getByText("Beginner"),
  );
});

it("parses a simple terminal transcript into command, comment, and output lines", () => {
  renderThemed(<SimpleTerminal title="Setup">{transcript}</SimpleTerminal>);

  expect(screen.getByText("Setup")).toBeOnTheScreen();
  expect(screen.getByText("# Install dependencies")).toBeOnTheScreen();
  expect(screen.getByText("pnpm install")).toBeOnTheScreen();
  expect(screen.getByText("Packages: +12")).toBeOnTheScreen();
  expect(screen.getByText("pnpm test")).toBeOnTheScreen();
});

it("copies only the command lines of a simple terminal transcript", async () => {
  const setText = jest.fn(async () => {});
  renderThemed(
    <SimpleTerminal
      clipboard={{ getText: async () => "", setText }}
      copyLabels={copyLabels}
      title="Setup"
    >
      {transcript}
    </SimpleTerminal>,
  );

  await act(async () => {
    fireEvent.press(screen.getByRole("button", { name: "Copy commands" }));
  });

  expect(setText).toHaveBeenCalledWith("pnpm install\npnpm test");
  expect(screen.getByRole("button", { name: "Copied" })).toBeOnTheScreen();
});
