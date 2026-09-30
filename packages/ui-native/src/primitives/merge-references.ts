import type { Ref, RefCallback } from "react";

/** Forwards one host instance to every given object or callback ref. */
function mergeReferences<T>(
  ...references: readonly (Ref<T> | undefined)[]
): RefCallback<T> {
  return (node) => {
    references.forEach((reference) => {
      if (typeof reference === "function") reference(node);
      else if (reference) reference.current = node;
    });
  };
}

export { mergeReferences };
