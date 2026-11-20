import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { type StyleProp, StyleSheet, type TextStyle } from "react-native";

import type { ReducedMotionService } from "../primitives/use-reduced-motion";
import { ThemeProvider, type ThemeSelection } from "../theme/theme-provider";

export {
  codePreviewTabs,
  gridListOptions,
  searchLabels,
  SquareGlyph,
} from "./fixture-data";

const ignoreSettlement = () => void 0;

/** Wraps an element in the light theme. */
export function themed(element: ReactElement) {
  return <ThemeProvider colorScheme="light">{element}</ThemeProvider>;
}

/** Renders an element inside a `ThemeProvider` (light unless specified). */
export function renderThemed(
  element: ReactElement,
  colorScheme: ThemeSelection = "light",
) {
  return render(
    <ThemeProvider colorScheme={colorScheme}>{element}</ThemeProvider>,
  );
}

/** Promise whose settlement the test controls. */
export function deferred<T = void>() {
  let resolve: (value: T) => void = ignoreSettlement;
  let reject: (error: unknown) => void = ignoreSettlement;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return {
    promise,
    reject,
    /** Rejects inside an async `act` so the resulting updates flush. */
    async rejectInAct(error: unknown) {
      await act(async () => {
        reject(error);
      });
    },
    resolve,
    /** Resolves inside an async `act` so the resulting updates flush. */
    async resolveInAct(value: T) {
      await act(async () => {
        resolve(value);
      });
    },
  };
}

/**
 * Reduced-motion service fake that resolves `preference`, or never settles
 * for `"pending"`.
 */
export function reducedMotion(
  preference: "pending" | boolean,
): ReducedMotionService {
  return {
    addEventListener: () => ({ remove: jest.fn() }),
    isReduceMotionEnabled:
      preference === "pending"
        ? () => new Promise(() => void 0)
        : async () => preference,
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

function isStyleProperty(value: unknown): value is StyleProp<TextStyle> {
  return value === undefined || value === false || isRecord(value);
}

/**
 * Flattened style of a rendered view or text host, or an empty style when it
 * has none. `prop` names another style prop, such as a scroll view's
 * `contentContainerStyle`. The node is `unknown` because the test renderer
 * ships no type declarations.
 */
export function styleOf(node: unknown, property = "style"): TextStyle {
  const style =
    isRecord(node) && isRecord(node.props) ? node.props[property] : undefined;
  if (style === undefined || style === false) return {};
  return isStyleProperty(style) ? StyleSheet.flatten(style) : {};
}

/**
 * Minimal responder grant that puts a Pressable host into its pressed state,
 * which `fireEvent.press` skips because `press` calls `onPress` alone.
 */
export function pressIn(node: unknown): void {
  fireEvent(node, "responderGrant", {
    currentTarget: undefined,
    nativeEvent: { changedTouches: [], target: 1, timestamp: 0, touches: [] },
    persist: ignoreSettlement,
    touchHistory: { indexOfSingleActiveTouch: -1, mostRecentTimeStamp: 0 },
  });
}

/** Lets already-queued promise callbacks settle inside `act`. */
export async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

/** Advances Jest fake timers by `milliseconds` inside `act`. */
export function advanceTimers(milliseconds: number) {
  act(() => {
    jest.advanceTimersByTime(milliseconds);
  });
}

/** Presses the named button twice within one `act`. */
export function pressTwice(name: string) {
  const button = screen.getByRole("button", { name });
  act(() => {
    fireEvent.press(button);
    fireEvent.press(button);
  });
}

/** A rendered node as the test renderer exposes it, typed to what tests read. */
export type HostNode = {
  readonly children: readonly unknown[];
  readonly props: Readonly<Record<string, unknown>>;
  readonly type: unknown;
};

function isHostNode(value: unknown): value is HostNode {
  return (
    typeof value === "object" &&
    value !== null &&
    "children" in value &&
    Array.isArray(value.children) &&
    "props" in value &&
    "type" in value
  );
}

/**
 * The node and everything below it, in render order. The node is `unknown`
 * because the test renderer ships no type declarations.
 */
export function descendants(node: unknown): readonly HostNode[] {
  return isHostNode(node) ? [node, ...node.children.flatMap(descendants)] : [];
}

/**
 * The rendered host views at or below `root` whose flattened style passes
 * `test`, in render order. Use it for parts a component does not expose
 * through a test ID or an accessibility query.
 */
export function viewsWhere(
  root: unknown,
  test: (style: TextStyle) => boolean,
): readonly HostNode[] {
  return descendants(root).filter(
    (node) => node.type === "View" && test(styleOf(node)),
  );
}
