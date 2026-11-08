/**
 * Elements that cannot hold the copy field as a child, or that render no
 * HTML children at all.
 */
const CANNOT_HOLD_FIELD = "button,input,select,textarea,svg,svg *";

/**
 * Runs the legacy `copy` command on the current selection. `execCommand` is
 * deprecated, yet no other synchronous copy path works where the async
 * Clipboard API is missing. This function looks it up by name and holds the
 * single call to it.
 */
function runCopyCommand(): boolean {
  const execute: unknown = Reflect.get(document, "execCommand");
  if (typeof execute !== "function") return false;
  const copied: unknown = Reflect.apply(execute, document, ["copy"]);
  return copied === true;
}

function createCopyField(value: string): HTMLTextAreaElement {
  const field = document.createElement("textarea");
  field.value = value;
  field.readOnly = true;
  field.style.cssText =
    "font-size:16px;left:-9999px;opacity:0;position:fixed;top:0";
  return field;
}

/**
 * Picks the element that receives the copy field: the focused element, or
 * its nearest ancestor that can hold a child. Whatever focus trap or inert
 * page lets the focused element keep focus then also lets the field have it,
 * with no list of known dialogs or menus to maintain.
 */
function findHost(focused: Element | null): HTMLElement {
  const host = focused?.closest(`:not(${CANNOT_HOLD_FIELD})`);
  return host instanceof HTMLElement && document.body.contains(host)
    ? host
    : document.body;
}

function saveSelection(): Range[] {
  const selection = document.getSelection();
  if (!selection) return [];
  return Array.from({ length: selection.rangeCount }, (_, index) =>
    selection.getRangeAt(index),
  );
}

function restoreSelection(ranges: Range[]): void {
  const selection = document.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  ranges.forEach((range) => {
    selection.addRange(range);
  });
}

function copyWithTextarea(value: string): boolean {
  if (typeof document === "undefined") return false;
  const previous = document.activeElement;
  const refocus =
    previous instanceof HTMLElement && previous.matches(":focus-visible")
      ? previous
      : undefined;
  const selection = saveSelection();
  const field = createCopyField(value);
  findHost(previous).append(field);
  try {
    field.focus({ preventScroll: true });
    field.setSelectionRange(0, value.length);
    return runCopyCommand();
  } catch {
    return false;
  } finally {
    field.remove();
    restoreSelection(selection);
    refocus?.focus({ preventScroll: true });
  }
}

/**
 * Writes `value` to the clipboard and resolves to `true` on success.
 *
 * Uses the async Clipboard API, which browsers hide outside secure contexts
 * (https, localhost). When the API is absent (plain http, such as a Tailnet IP)
 * or `writeText` rejects, it falls back to a temporary off-screen textarea and
 * `document.execCommand("copy")`. The textarea mounts inside the focused
 * element, or next to it when that element is a form control: a modal focus
 * trap (dialog, alert dialog, menu) or an inert page would otherwise take the
 * selection back and leave the clipboard unchanged. The fallback gives back the
 * text the user had selected on the page. It also gives back focus when it
 * came from the keyboard (`:focus-visible`), but not focus a pointer click
 * gave: restoring that fires focus handlers late, and the tooltip of a
 * button the pointer already left would open and stay open. Resolves to
 * `false` when neither path works.
 *
 * Call it from a user gesture such as a click handler; browsers refuse
 * clipboard writes otherwise.
 *
 * @param value - The text to copy.
 * @returns Whether the text reached the clipboard.
 *
 * @example
 * ```ts
 * const ok = await copyText(apiKey)
 * ```
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return copyWithTextarea(value);
  }
}
