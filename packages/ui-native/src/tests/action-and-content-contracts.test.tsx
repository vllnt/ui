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

const labels = {
  allCompleted: "Done",
  item: (item: { label: string }) => item.label,
  progress: (checked: number, total: number) => `${checked}/${total}`,
};
const items = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
];

function deferred() {
  let resolve: () => void = jest.fn();
  let reject: (error: Error) => void = jest.fn();
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, reject, resolve };
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe("Native A-C individual audit regressions", () => {
  it("filters removed uncontrolled checklist ids before progress and completion", () => {
    const onComplete = jest.fn();
    const onChange = jest.fn();
    const view = render(
      <ThemeProvider>
        <Checklist
          defaultCheckedIds={["a"]}
          items={items}
          labels={labels}
          onCheckedIdsChange={onChange}
          onComplete={onComplete}
        />
      </ThemeProvider>,
    );
    view.rerender(
      <ThemeProvider>
        <Checklist
          defaultCheckedIds={["a"]}
          items={[{ id: "b", label: "B" }]}
          labels={labels}
          onCheckedIdsChange={onChange}
          onComplete={onComplete}
        />
      </ThemeProvider>,
    );
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
    render(
      <ThemeProvider>
        <Callout testID="callout" title="Notice">
          Important details
        </Callout>
      </ThemeProvider>,
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
      render(
        <ThemeProvider>
          <CompletionDialog
            cancelLabel="Cancel"
            closeLabel="Close"
            confirmLabel="Finish"
            description={description}
            onCancel={jest.fn()}
            onConfirm={jest.fn()}
            open
            title="Complete"
          />
        </ThemeProvider>,
      );
      expect(screen.getByText(String(description))).toBeTruthy();
    },
  );

  it.each([Number.NaN, Infinity, -Infinity])(
    "keeps nonfinite agent progress %p out of native layout and a11y",
    (value) => {
      render(
        <ThemeProvider>
          <AgentStepProgress label="Progress" value={value} />
        </ThemeProvider>,
      );
      expect(screen.getByRole("progressbar").props.accessibilityValue.now).toBe(
        0,
      );
    },
  );

  it("keeps command actions tappable while the search keyboard is open", () => {
    const view = render(
      <ThemeProvider>
        <Command
          cancelLabel="Cancel"
          emptyLabel="Empty"
          items={[]}
          label="Commands"
          open
          placeholder="Search"
        />
      </ThemeProvider>,
    );
    expect(
      view.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps,
    ).toBe("handled");
  });

  it("disables hidden reveal hit testing and restores caller pointer policy", () => {
    const view = render(
      <ThemeProvider>
        <BlurReveal pointerEvents="box-none" testID="reveal" visible={false}>
          <Text>Hidden</Text>
        </BlurReveal>
      </ThemeProvider>,
    );
    expect(
      screen.getByTestId("reveal", { includeHiddenElements: true }).props
        .pointerEvents,
    ).toBe("none");
    view.rerender(
      <ThemeProvider>
        <BlurReveal pointerEvents="box-none" testID="reveal">
          <Text>Visible</Text>
        </BlurReveal>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("reveal").props.pointerEvents).toBe("box-none");
  });

  it("stops tab selection animation on unmount", () => {
    const stop = jest.fn();
    jest
      .spyOn(Animated, "timing")
      .mockReturnValue({ reset: jest.fn(), start: jest.fn(), stop });
    const view = render(
      <ThemeProvider>
        <AnimatedTabs tabs={[{ label: "A", value: "a" }]} />
      </ThemeProvider>,
    );
    view.unmount();
    expect(stop).toHaveBeenCalled();
  });

  it("stops disclosure animation when closed", () => {
    const stop = jest.fn();
    jest
      .spyOn(Animated, "timing")
      .mockReturnValue({ reset: jest.fn(), start: jest.fn(), stop });
    render(
      <ThemeProvider>
        <Collapsible defaultOpen id="details">
          <CollapsibleTrigger label="Toggle">
            <Text>Toggle</Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Text>Body</Text>
          </CollapsibleContent>
        </Collapsible>
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByRole("button", { name: "Toggle" }));
    expect(stop).toHaveBeenCalled();
    expect(screen.queryByText("Body")).toBeNull();
  });

  it("preserves unsent composer text when no submit adapter exists", () => {
    render(
      <ThemeProvider>
        <AIChatInput
          defaultValue="Draft"
          inputLabel="Message"
          submitLabel="Send"
        />
      </ThemeProvider>,
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
    const clipboard = {
      getText: async () => "",
      setText: () => pending.promise,
    };
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
    const clipboard = {
      getText: async () => "",
      setText: () => pending.promise,
    };
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
    const view = render(
      <ThemeProvider>
        <CodeBlock
          clipboard={{
            getText: async () => "",
            setText: () => pending.promise,
          }}
          code="a"
          copyLabels={{
            copied: "Copied",
            copy: "Copy",
            unavailable: "Unavailable",
          }}
          onCopySuccess={onCopySuccess}
        />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByRole("button", { name: "Copy" }));
    view.unmount();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(onCopySuccess).not.toHaveBeenCalled();
  });
});
