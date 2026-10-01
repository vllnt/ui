/**
 * Moves focus to the calendar day that holds the roving tab stop (the
 * selected day, else today) when the popover opens, per the WAI-ARIA APG
 * date picker dialog.
 */
export function focusCalendarDay(event: Event): void {
  const { currentTarget } = event;
  if (!(currentTarget instanceof HTMLElement)) return;
  const day = currentTarget.querySelector<HTMLElement>(
    '[role="grid"] button[tabindex="0"]',
  );
  if (!day) return;
  event.preventDefault();
  day.focus();
}
