"use client";

import { useEffect } from "react";

import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ].filter((element) => !element.closest("[hidden]") && !element.inert);
}

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
 * Call this hook before any effect that moves focus into the modal, so the
 * hook sees the opener first.
 *
 * @param containerReference - ref to the modal element.
 * @param enabled - true while the modal is open.
 */
export function useFocusContainment(
  containerReference: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return;

    const opener = document.activeElement;
    const container = containerReference.current;
    if (container && !container.contains(opener)) {
      getFocusable(container)[0]?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      const current = containerReference.current;
      if (event.key === "Tab" && current) containTab(event, current);
    };
    // Capture phase, so dialogs that stop key events in their panel still trap Tab.
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (
        opener instanceof HTMLElement &&
        opener !== document.body &&
        opener.isConnected
      ) {
        opener.focus();
      }
    };
  }, [containerReference, enabled]);
}
