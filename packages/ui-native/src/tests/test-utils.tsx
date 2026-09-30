import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Text } from "react-native";

import type { SearchDialogLabels } from "../components/search-dialog/search-dialog";
import type { ReducedMotionService } from "../primitives/use-reduced-motion";
import { ThemeProvider, type ThemeSelection } from "../theme/theme-provider";

const ignoreSettlement = () => void 0;

/** Code/Preview tabs whose panels render "<label> panel". */
export const codePreviewTabs = [
  { label: "Code", panel: <Text>Code panel</Text>, value: "code" },
  { label: "Preview", panel: <Text>Preview panel</Text>, value: "preview" },
];

/** SearchDialog labels that name each result by its title. */
export const searchLabels: SearchDialogLabels = {
  clear: "Clear",
  close: "Close",
  componentsGroup: "Components",
  docsEmpty: "No docs",
  docsGroup: "Docs",
  empty: "No results",
  minimumDocsQuery: (minimum) => `Type ${minimum}`,
  open: "Open search",
  result: (item) => item.title,
  scope: "Scope",
  scopeOption: {
    components: "Components only",
    docs: "Docs only",
    everything: "Everything",
  },
  searchingDocs: "Searching docs",
  searchPlaceholder: "Search",
  title: "Search docs",
};

/** Grid/List view-switcher options whose panels render "<label> panel". */
export const gridListOptions = [
  { key: "grid", label: "Grid", panel: <Text>Grid panel</Text> },
  { key: "list", label: "List", panel: <Text>List panel</Text> },
];

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
