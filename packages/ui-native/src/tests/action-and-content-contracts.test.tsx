import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { Animated, ScrollView, Text } from "react-native";

import { AgentStepProgress } from "../components/agent-activity/agent-activity";
import { AIChatInput } from "../components/ai-chat-input/ai-chat-input";
import { AnimatedTabs } from "../components/animated-tabs/animated-tabs";
import { BlurReveal } from "../components/blur-reveal/blur-reveal";
import { Callout } from "../components/callout/callout";
import { Checklist } from "../components/checklist/checklist";
import { CodeBlock } from "../components/code-block/code-block";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/collapsible/collapsible";
import { Command } from "../components/command/command";
import { CompletionDialog } from "../components/completion-dialog/completion-dialog";
import { useCopyToClipboard } from "../components/copy-button/copy-button";
import { ThemeProvider } from "../theme/theme-provider";

import { deferred, renderThemed } from "./test-utils";

const labels = {
  allCompleted: "Done",
  item: (item: { label: string }) => item.label,
  progress: (checked: number, total: number) => `${checked}/${total}`,
};
const items = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
];

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it("filters removed uncontrolled checklist ids before progress and completion", () => {
  const onComplete = jest.fn();
  const onChange = jest.fn();
  const checklist = (checklistItems: typeof items) => (
    <ThemeProvider>
      <Checklist
        defaultCheckedIds={["a"]}
        items={checklistItems}
        labels={labels}
        onCheckedIdsChange={onChange}
        onComplete={onComplete}
      />
    </ThemeProvider>
  );
  render(checklist(items));
  screen.rerender(checklist(items.slice(1)));
  expect(screen.getByRole("progressbar").props.accessibilityValue).toEqual({
    max: 1,
    min: 0,
    now: 0,
    text: "0/1",
  });
  fireEvent.press(screen.getByRole("checkbox", { name: "B" }));
  expect(onChange).toHaveBeenLastCalledWith(["b"]);
  expect(onComplete).toHaveBeenCalledTimes(1);
});

it("does not collapse callout body and nested actions into a title-only accessible node", () => {
  renderThemed(
    <Callout testID="callout" title="Notice">
      Important details
    </Callout>,
    "system",
  );
  expect(screen.getByTestId("callout").props.accessible).not.toBe(true);
  expect(
    screen.getByTestId("callout").props.accessibilityLabel,
  ).toBeUndefined();
  expect(screen.getByText("Important details")).toBeTruthy();
});

it.each(["Details", 0])(
  "wraps completion dialog description %p in native Text",
  (description) => {
    renderThemed(
      <CompletionDialog
        cancelLabel="Cancel"
        closeLabel="Close"
        confirmLabel="Finish"
        description={description}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        open
        title="Complete"
      />,
      "system",
    );
    expect(screen.getByText(String(description))).toBeTruthy();
  },
);

it.each([Number.NaN, Infinity, -Infinity])(
  "keeps nonfinite agent progress %p out of native layout and a11y",
  (value) => {
    renderThemed(
      <AgentStepProgress label="Progress" value={value} />,
      "system",
    );
    expect(screen.getByRole("progressbar").props.accessibilityValue.now).toBe(
      0,
    );
  },
);

it("keeps command actions tappable while the search keyboard is open", () => {
  const view = renderThemed(
    <Command
      cancelLabel="Cancel"
      emptyLabel="Empty"
      items={[]}
      label="Commands"
      open
      placeholder="Search"
    />,
    "system",
  );
  expect(
    view.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps,
  ).toBe("handled");
});

it("disables hidden reveal hit testing and restores caller pointer policy", () => {
  const reveal = (text: string, visible?: boolean) => (
    <ThemeProvider>
      <BlurReveal pointerEvents="box-none" testID="reveal" visible={visible}>
        <Text>{text}</Text>
      </BlurReveal>
    </ThemeProvider>
  );
  render(reveal("Hidden", false));
  expect(
    screen.getByTestId("reveal", { includeHiddenElements: true }).props
      .pointerEvents,
  ).toBe("none");
  screen.rerender(reveal("Visible"));
  expect(screen.getByTestId("reveal").props.pointerEvents).toBe("box-none");
});

it("stops tab selection animation on unmount", () => {
  const stop = jest.fn();
  jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ reset: jest.fn(), start: jest.fn(), stop });
  const view = renderThemed(
    <AnimatedTabs tabs={[{ label: "A", value: "a" }]} />,
    "system",
  );
  view.unmount();
  expect(stop).toHaveBeenCalled();
});

it("stops disclosure animation when closed", () => {
  const stop = jest.fn();
  jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ reset: jest.fn(), start: jest.fn(), stop });
  renderThemed(
    <Collapsible defaultOpen id="details">
      <CollapsibleTrigger label="Toggle">
        <Text>Toggle</Text>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Text>Body</Text>
      </CollapsibleContent>
    </Collapsible>,
    "system",
  );
  fireEvent.press(screen.getByRole("button", { name: "Toggle" }));
  expect(stop).toHaveBeenCalled();
  expect(screen.queryByText("Body")).toBeNull();
});

it("links disclosure parts only while their counterparts are mounted", () => {
  const tree = (parts: { content: boolean; trigger: boolean }) => (
    <ThemeProvider>
      <Collapsible defaultOpen id="details">
        {parts.trigger ? (
          <CollapsibleTrigger label="Toggle">
            <Text>Toggle</Text>
          </CollapsibleTrigger>
        ) : null}
        {parts.content ? (
          <CollapsibleContent testID="details-content">
            <Text>Body</Text>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
    </ThemeProvider>
  );
  render(tree({ content: true, trigger: false }));
  expect(
    screen.getByTestId("details-content").props["aria-labelledby"],
  ).toBeUndefined();
  screen.rerender(tree({ content: true, trigger: true }));
  expect(screen.getByTestId("details-content")).toHaveProp(
    "aria-labelledby",
    "details-trigger",
  );
  expect(screen.getByRole("button", { name: "Toggle" })).not.toHaveProp(
    "aria-controls",
  );
  screen.rerender(tree({ content: false, trigger: true }));
  expect(screen.getByRole("button", { name: "Toggle" })).toHaveProp(
    "accessibilityState",
    expect.objectContaining({ expanded: true }),
  );
  screen.rerender(tree({ content: true, trigger: false }));
  expect(
    screen.getByTestId("details-content").props["aria-labelledby"],
  ).toBeUndefined();
});

it("preserves unsent composer text when no submit adapter exists", () => {
  renderThemed(
    <AIChatInput
      defaultValue="Draft"
      inputLabel="Message"
      submitLabel="Send"
    />,
    "system",
  );
  expect(
    screen.getByRole("button", { name: "Send" }).props.accessibilityState
      .disabled,
  ).toBe(true);
  fireEvent(screen.getByLabelText("Message"), "submitEditing");
  expect(screen.getByDisplayValue("Draft")).toBeTruthy();
});

it("does not schedule a reset after clipboard completion following unmount", async () => {
  jest.useFakeTimers();
  const pending = deferred();
  const clipboard = { getText: async () => "", setText: () => pending.promise };
  const { result, unmount } = renderHook(() =>
    useCopyToClipboard({ clipboard }),
  );
  let copy: Promise<boolean> | undefined;
  act(() => {
    copy = result.current.copy("a");
  });
  unmount();
  const schedule = jest.spyOn(global, "setTimeout");
  await act(async () => {
    pending.resolve();
    await copy;
  });
  expect(schedule).not.toHaveBeenCalled();
});

it("ignores stale clipboard success after a newer failure", async () => {
  const older = deferred();
  const newer = deferred();
  const clipboard = {
    getText: async () => "",
    setText: jest
      .fn()
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise),
  };
  const { result } = renderHook(() => useCopyToClipboard({ clipboard }));
  let first: Promise<boolean> | undefined;
  let second: Promise<boolean> | undefined;
  act(() => {
    first = result.current.copy("old");
    second = result.current.copy("new");
  });
  await act(async () => {
    newer.reject(new Error("denied"));
    await second;
  });
  await act(async () => {
    older.resolve();
    await first;
  });
  expect(result.current.status).toBe("error");
});

it("invalidates a pending clipboard operation on reset", async () => {
  const pending = deferred();
  const clipboard = { getText: async () => "", setText: () => pending.promise };
  const { result } = renderHook(() => useCopyToClipboard({ clipboard }));
  let copy: Promise<boolean> | undefined;
  act(() => {
    copy = result.current.copy("a");
    result.current.reset();
  });
  await act(async () => {
    pending.resolve();
    await copy;
  });
  expect(result.current.status).toBe("idle");
});

it("does not notify code copy success after unmount", async () => {
  const pending = deferred();
  const onCopySuccess = jest.fn();
  const view = renderThemed(
    <CodeBlock
      clipboard={{ getText: async () => "", setText: () => pending.promise }}
      code="a"
      copyLabels={{
        copied: "Copied",
        copy: "Copy",
        unavailable: "Unavailable",
      }}
      onCopySuccess={onCopySuccess}
    />,
    "system",
  );
  fireEvent.press(screen.getByRole("button", { name: "Copy" }));
  view.unmount();
  await act(async () => {
    pending.resolve();
    await pending.promise;
  });
  expect(onCopySuccess).not.toHaveBeenCalled();
});
