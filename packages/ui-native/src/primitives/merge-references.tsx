"use client";

import { type Ref, type RefCallback, useCallback } from "react";

type ReferenceCleanup = () => void;

/**
 * Attaches `node` to one ref and returns how to detach it: the callback ref's
 * own React 19 cleanup when it returned one, otherwise a call with `null` (or
 * clearing an object ref).
 */
function attachReference<T>(
  reference: Ref<T> | undefined,
  node: T,
): ReferenceCleanup | undefined {
  if (typeof reference === "function") {
    const cleanup = reference(node);
    if (typeof cleanup === "function") return cleanup;
    return () => {
      reference(null);
    };
  }
  if (!reference) return undefined;
  reference.current = node;
  return () => {
    reference.current = null;
  };
}

/**
 * Returns one stable callback ref that forwards a host instance to a local
 * and a caller-supplied ref (object or callback, including React 19 refs that
 * return a cleanup). The callback changes when one of the refs changes and at
 * no other time, so caller callback refs do not run again on every render;
 * on detach each ref's own cleanup runs, or the ref receives `null`.
 */
function useMergedReferences<T>(
  first: Ref<T> | undefined,
  second: Ref<T> | undefined,
): RefCallback<T> {
  return useCallback(
    (node: null | T) => {
      if (node === null) return;
      const cleanups = [first, second].map((reference) =>
        attachReference(reference, node),
      );
      return () => {
        cleanups.forEach((cleanup) => {
          cleanup?.();
        });
      };
    },
    [first, second],
  );
}

export { useMergedReferences };
