import { useRef, useState } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { flushMicrotasks } from "../tests/test-utils";

import {
  announce,
  focusAccessibility,
  plainText,
  useAnnounceOnChange,
  useFocusWhenShown,
  useRevealFocus,
} from "./accessibility";
import { useMergedReferences } from "./merge-references";
import { useScreenReaderEnabled } from "./use-screen-reader-enabled";

const hostNode = () => ({ measure: jest.fn() });
let announceSpy: jest.SpyInstance;
let focusSpy: jest.SpyInstance;

beforeEach(() => {
  announceSpy = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  focusSpy = jest.spyOn(AccessibilityInfo, "sendAccessibilityEvent");
  announceSpy.mockClear();
  focusSpy.mockClear();
});

it("treats empty conditional children as empty text", () => {
  const required = false;
  expect(plainText(["Email", required && "*"])).toBe("Email");
  expect(plainText(["Email", null, undefined, true, " *"])).toBe("Email *");
  expect(plainText(["Total: ", 3])).toBe("Total: 3");
  expect(plainText(["Name", <Text key="x">x</Text>])).toBeUndefined();
  expect(plainText(null)).toBeUndefined();
});

it("coalesces announcements queued in one tick and skips empty text", async () => {
  announce("Name is required");
  announce("  ");
  announce("Email is required");
  announce("Name is required");
  expect(announceSpy).not.toHaveBeenCalled();
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledTimes(1);
  expect(announceSpy).toHaveBeenCalledWith(
    "Name is required. Email is required",
  );
});

it("leaves live-region text to TalkBack on Android", async () => {
  const os = jest.replaceProperty(Platform, "OS", "android");
  announce("Saved", { liveRegion: true });
  await flushMicrotasks();
  expect(announceSpy).not.toHaveBeenCalled();
  announce("Copied");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledWith("Copied");
  os.restore();
});

function AnnounceProbe({
  initial,
  message,
}: {
  readonly initial?: boolean;
  readonly message?: string;
}) {
  useAnnounceOnChange(message, { initial });
  return null;
}

it("announces a message when it changes, not on first render unless asked", async () => {
  const view = render(<AnnounceProbe message="Idle" />);
  await flushMicrotasks();
  expect(announceSpy).not.toHaveBeenCalled();
  view.rerender(<AnnounceProbe message="Idle" />);
  view.rerender(<AnnounceProbe message="Done" />);
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledTimes(1);
  expect(announceSpy).toHaveBeenCalledWith("Done");
  view.rerender(<AnnounceProbe />);
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenCalledTimes(1);
  render(<AnnounceProbe initial message="Error" />);
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("Error");
});

function RevealProbe() {
  const [shown, setShown] = useState(false);
  const { request, target } = useRevealFocus<View>(shown);
  return shown ? (
    <View accessible ref={target}>
      <Text>Hint text</Text>
    </View>
  ) : (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        request();
        setShown(true);
      }}
    >
      <Text>Show hint</Text>
    </Pressable>
  );
}

it("moves focus to revealed content only after a request", () => {
  render(<RevealProbe />, { createNodeMock: hostNode });
  expect(focusSpy).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "Show hint" }));
  expect(focusSpy).toHaveBeenCalledTimes(1);
});

function TitleProbe({ shown }: { readonly shown: boolean }) {
  const title = useFocusWhenShown<Text>(shown);
  return shown ? <Text ref={title}>Menu</Text> : null;
}

it("focuses a title each time it is shown", () => {
  const view = render(<TitleProbe shown={false} />, {
    createNodeMock: hostNode,
  });
  expect(focusSpy).not.toHaveBeenCalled();
  view.rerender(<TitleProbe shown />);
  view.rerender(<TitleProbe shown />);
  expect(focusSpy).toHaveBeenCalledTimes(1);
});

it("skips focus moves where the platform has no sendAccessibilityEvent", () => {
  const original = AccessibilityInfo.sendAccessibilityEvent;
  Reflect.deleteProperty(AccessibilityInfo, "sendAccessibilityEvent");
  expect(() => {
    focusAccessibility({ current: hostNode() });
  }).not.toThrow();
  Object.assign(AccessibilityInfo, { sendAccessibilityEvent: original });
  focusAccessibility({ current: hostNode() });
  focusAccessibility({ current: null });
  expect(focusSpy).toHaveBeenCalledTimes(1);
});

function MergeProbe({
  callerRef,
  label,
}: {
  readonly callerRef: (node: unknown) => void;
  readonly label: string;
}) {
  const local = useRef<unknown>(null);
  const merged = useMergedReferences<unknown>(local, callerRef);
  return <View ref={merged} testID={label} />;
}

it("keeps the merged ref stable so caller refs run once per mount", () => {
  const callerRef = jest.fn();
  const view = render(<MergeProbe callerRef={callerRef} label="one" />, {
    createNodeMock: hostNode,
  });
  view.rerender(<MergeProbe callerRef={callerRef} label="two" />);
  view.rerender(<MergeProbe callerRef={callerRef} label="three" />);
  expect(callerRef).toHaveBeenCalledTimes(1);
  view.unmount();
  expect(callerRef).toHaveBeenLastCalledWith(null);
});

function ScreenReaderProbe() {
  return <Text>{useScreenReaderEnabled() ? "on" : "off"}</Text>;
}

function isBooleanListener(value: unknown): value is (on: boolean) => void {
  return typeof value === "function";
}

it("tracks the screen reader state and removes its listener", async () => {
  jest
    .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
    .mockResolvedValue(true);
  const subscribe = jest.spyOn(AccessibilityInfo, "addEventListener");
  subscribe.mockClear();
  const view = render(<ScreenReaderProbe />);
  expect(screen.getByText("off")).toBeOnTheScreen();
  await flushMicrotasks();
  expect(screen.getByText("on")).toBeOnTheScreen();
  const calls: readonly (readonly unknown[])[] = subscribe.mock.calls;
  const index = calls.findIndex(
    ([eventName]) => eventName === "screenReaderChanged",
  );
  const listener = calls[index]?.[1];
  if (!isBooleanListener(listener)) throw new Error("Expected a listener.");
  act(() => {
    listener(false);
  });
  expect(screen.getByText("off")).toBeOnTheScreen();
  const subscription = subscribe.mock.results[index]?.value;
  view.unmount();
  expect(subscription?.remove).toHaveBeenCalledTimes(1);
  subscribe.mockRestore();
  jest
    .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
    .mockImplementation(() => new Promise(() => {}));
});
