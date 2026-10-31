"use client";

import { useEffect, useRef } from "react";

import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ].filter(
    (element) =>
      !element.closest("[hidden], [inert]") &&
      !element.inert &&
      !element.matches("input[type=hidden]"),
  );
}

// Enabled containments, oldest first. The last one handles Tab, so
// stacked modals do not fight over focus.
const activeContainments: symbol[] = [];

function containTab(event: KeyboardEvent, container: HTMLElement): void {
  const focusable = getFocusable(container);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) {
    event.preventDefault();
    return;
  }

  const active = document.activeElement;
  if (!container.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Keeps keyboard focus inside a custom modal while `enabled` is true: Tab and
 * Shift+Tab cycle through the container's focusable elements, and when the
 * modal closes (or unmounts) focus returns to the element that had it when the
 * modal opened. For Radix dialogs use `useReturnFocus` instead; they already
 * trap focus.
 *
 * The opener is the focused element when the hook becomes enabled, or, when a
 * child took focus during commit (`autoFocus`), the element that handed focus
 * directly to it. A blur to nothing (a click on empty page space) records no
 * opener. On close, focus moves back to the opener when this modal or the body
 * still holds it, so closing a lower modal leaves focus in the modal above it.
 *
 * @param containerReference - ref to the modal element.
 * @param enabled - true while the modal is open.
 */
export function useFocusContainment(
  containerReference: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  const lastBlurred = useRef<Node | undefined>(undefined);

  useEffect(() => {
    if (enabled) return;
    const handleFocusOut = (event: FocusEvent): void => {
      lastBlurred.current =
        event.relatedTarget instanceof Node && event.target instanceof Node
          ? event.target
          : undefined;
    };
    document.addEventListener("focusout", handleFocusOut, true);
    return () => {
      document.removeEventListener("focusout", handleFocusOut, true);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerReference.current;
    const active = document.activeElement;
    const opener =
      active && active !== document.body && !container?.contains(active)
        ? active
        : lastBlurred.current;
    lastBlurred.current = undefined;
    const token = Symbol("focus-containment");
    activeContainments.push(token);
    if (container && !(opener && container.contains(opener))) {
      getFocusable(container)[0]?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      const current = containerReference.current;
      if (event.key === "Tab" && current && activeContainments.at(-1) === token)
        containTab(event, current);
    };
    // Capture phase, so dialogs that stop key events in their panel still trap Tab.
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      activeContainments.splice(activeContainments.indexOf(token), 1);
      const focused = document.activeElement;
      const focusStillHere =
        !focused || focused === document.body || container?.contains(focused);
      if (
        focusStillHere &&
        opener instanceof HTMLElement &&
        opener !== document.body &&
        opener.isConnected
      ) {
        opener.focus();
      }
    };
  }, [containerReference, enabled]);
}
