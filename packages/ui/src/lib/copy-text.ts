function hasClipboardApi(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function"
  );
}

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
  field.style.cssText = "left:-9999px;opacity:0;position:fixed;top:0";
  return field;
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
  const selection = saveSelection();
  const host =
    previous?.closest('[role="dialog"],[role="alertdialog"],dialog[open]') ??
    document.body;
  const field = createCopyField(value);
  host.append(field);
  try {
    field.focus({ preventScroll: true });
    field.setSelectionRange(0, value.length);
    return runCopyCommand();
  } catch {
    return false;
  } finally {
    field.remove();
    restoreSelection(selection);
    if (previous instanceof HTMLElement) {
      previous.focus({ preventScroll: true });
    }
  }
}

/**
 * Writes `value` to the clipboard and resolves to `true` on success.
 *
 * Uses the async Clipboard API, which browsers hide outside secure contexts
 * (https, localhost). When the API is absent (plain http, such as a Tailnet IP)
 * or `writeText` rejects, it falls back to a temporary off-screen textarea and
 * `document.execCommand("copy")`. The textarea mounts inside the open dialog
 * that holds focus, if any (a `dialog` or `alertdialog` role, or a native
 * `dialog` element): a modal focus trap would otherwise take the selection
 * back and leave the clipboard empty. The fallback gives back the text the
 * user had selected on the page and the focus. Resolves to `false` when
 * neither path works.
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
  if (hasClipboardApi()) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return copyWithTextarea(value);
    }
  }
  return copyWithTextarea(value);
}
