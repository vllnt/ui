"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { copyText } from "../../../lib/copy-text";

const FALLBACK_TIMEOUT_MS = 2000;

/**
 * Options for {@link useCopyToClipboard}.
 *
 * @public
 */
export type UseCopyToClipboardOptions = {
  /** Milliseconds the `copied` flag stays true after a successful copy. */
  timeout?: number;
};

/**
 * Return shape for {@link useCopyToClipboard}.
 *
 * @public
 */
export type UseCopyToClipboardResult = {
  /** True for `timeout` ms after the most recent successful copy. */
  copied: boolean;
  /**
   * Writes `value` to the clipboard. Resolves to `true` on success. Resolves to
   * `false` when the copy fails and sets `copied` back to `false`. Falls back
   * to a textarea copy where the async Clipboard API is missing (plain http).
   */
  copy: (value: string) => Promise<boolean>;
  /** Clears the `copied` flag and pending timer. */
  reset: () => void;
};

/**
 * React hook that copies arbitrary strings to the clipboard with a transient
 * `copied` flag suitable for visual feedback.
 *
 * @example
 * ```tsx
 * const { copied, copy } = useCopyToClipboard()
 * <button onClick={() => copy(apiKey)}>{copied ? "Copied!" : "Copy"}</button>
 * ```
 *
 * @public
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardResult {
  const { timeout = FALLBACK_TIMEOUT_MS } = options;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      const ok = await copyText(value);
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
      if (!ok) {
        setCopied(false);
        return false;
      }
      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, timeout);
      return true;
    },
    [timeout],
  );

  return { copied, copy, reset };
}
