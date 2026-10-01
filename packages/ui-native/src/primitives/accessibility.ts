"use client";

import { type ReactNode, type RefObject, useEffect, useRef } from "react";

import { AccessibilityInfo, type HostInstance, Platform } from "react-native";

/**
 * Hides purely visual content (icons, glyphs, dots) from both VoiceOver
 * (`accessibilityElementsHidden`) and TalkBack (`importantForAccessibility`).
 */
const decorativeProps = {
  accessibilityElementsHidden: true,
  importantForAccessibility: "no-hide-descendants",
} as const;

/** Options for {@link announce}. */
type AnnounceOptions = {
  /**
   * The same text already renders inside an Android `accessibilityLiveRegion`:
   * skip Android so TalkBack does not speak it twice, and speak on iOS, which
   * ignores live regions.
   */
  readonly liveRegion?: boolean;
};

/** Options for {@link useAnnounceOnChange}. */
type AnnounceOnChangeOptions = AnnounceOptions & {
  /** Also announces the message present on the first render. */
  readonly initial?: boolean;
};

const pendingAnnouncements: string[] = [];

function flushAnnouncements() {
  const text = [...new Set(pendingAnnouncements.splice(0))].join(". ");
  if (
    text.length > 0 &&
    typeof AccessibilityInfo.announceForAccessibility === "function"
  )
    AccessibilityInfo.announceForAccessibility(text);
}

/**
 * Speaks a message through the active screen reader. iOS has no live regions,
 * so route every state change that users must hear without moving focus
 * through this helper. Messages queued in the same tick (for example two
 * field errors after one submit) become one announcement, because each new
 * announcement interrupts the previous one.
 */
function announce(message: string | undefined, options: AnnounceOptions = {}) {
  const text = message?.trim();
  if (!text) return;
  if (options.liveRegion === true && Platform.OS === "android") return;
  if (pendingAnnouncements.length === 0)
    void Promise.resolve().then(flushAnnouncements);
  pendingAnnouncements.push(text);
}

/**
 * Announces `message` whenever it changes to a new non-empty value after the
 * first render. Pass `undefined` to stay silent for the current state.
 */
function useAnnounceOnChange(
  message: string | undefined,
  options: AnnounceOnChangeOptions = {},
) {
  const { initial = false, liveRegion } = options;
  const previous = useRef(initial ? undefined : message);
  useEffect(() => {
    if (previous.current === message) return;
    previous.current = message;
    announce(message, { liveRegion });
  }, [liveRegion, message]);
}

function isHostInstance(value: unknown): value is HostInstance {
  return typeof value === "object" && value !== null && "measure" in value;
}

/**
 * Moves screen-reader focus to a mounted host element (View, Text, TextInput).
 * Does nothing where the platform lacks `sendAccessibilityEvent` (for example
 * react-native-web).
 */
function focusAccessibility(target: RefObject<unknown>) {
  const node = target.current;
  if (
    isHostInstance(node) &&
    typeof AccessibilityInfo.sendAccessibilityEvent === "function"
  ) {
    AccessibilityInfo.sendAccessibilityEvent(node, "focus");
  }
}

/**
 * Moves screen-reader focus to the attached element (a sheet or menu
 * title) each time `shown` turns true, so the title speaks once without a
 * separate announcement.
 */
function useFocusWhenShown<T>(shown: boolean) {
  const target = useRef<T>(null);
  useEffect(() => {
    if (shown) focusAccessibility(target);
  }, [shown]);
  return target;
}

/**
 * Moves screen-reader focus to content revealed by a user action (a hint, an
 * answer) so focus is not lost when the pressed control unmounts. Call
 * `request()` in the press handler and attach `target` to the revealed element.
 */
function useRevealFocus<T>(revealed: boolean) {
  const target = useRef<T>(null);
  const pending = useRef(false);
  useEffect(() => {
    if (!revealed || !pending.current) return;
    pending.current = false;
    focusAccessibility(target);
  }, [revealed]);
  return {
    request: () => {
      pending.current = true;
    },
    target,
  };
}

function plainTextPart(node: ReactNode): string | undefined {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  return plainText(node);
}

/**
 * Returns the plain text of string, number, or array children, or
 * `undefined` when the content contains elements whose text is unknown.
 * Inside arrays, `null`, `undefined`, and booleans (conditional children such
 * as `{required && "*"}`) count as empty text.
 */
function plainText(node: ReactNode): string | undefined {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!Array.isArray(node)) return undefined;
  const parts = node.map((child: ReactNode) => plainTextPart(child));
  return parts.every((part) => part !== undefined) ? parts.join("") : undefined;
}

/** Joins the defined, non-empty parts of an accessibility hint or label. */
function joinAccessibilityText(
  parts: readonly (false | null | string | undefined)[],
  separator = ". ",
): string | undefined {
  const text = parts
    .filter((part): part is string => typeof part === "string")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(separator);
  return text.length > 0 ? text : undefined;
}

export type { AnnounceOnChangeOptions, AnnounceOptions };
export {
  announce,
  decorativeProps,
  focusAccessibility,
  joinAccessibilityText,
  plainText,
  useAnnounceOnChange,
  useFocusWhenShown,
  useRevealFocus,
};
