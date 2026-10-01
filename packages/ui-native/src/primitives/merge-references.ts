"use client";

import { type Ref, type RefCallback, useCallback } from "react";

function assignReference<T>(reference: Ref<T> | undefined, node: null | T) {
  if (typeof reference === "function") reference(node);
  else if (reference) reference.current = node;
}

/**
 * Returns one stable callback ref that forwards a host instance to a local
 * and a caller-supplied ref (object or callback). The callback changes when
 * one of the refs changes and at no other time, so caller callback refs do
 * not run again on every render.
 */
function useMergedReferences<T>(
  first: Ref<T> | undefined,
  second: Ref<T> | undefined,
): RefCallback<T> {
  return useCallback(
    (node: null | T) => {
      assignReference(first, node);
      assignReference(second, node);
    },
    [first, second],
  );
}

export { useMergedReferences };
