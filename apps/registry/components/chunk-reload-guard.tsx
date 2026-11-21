"use client";

import { useEffect } from "react";

import { recoverFromChunkError } from "@/lib/chunk-reload";

/**
 * Reloads once when a script chunk fails to load outside React's render, for
 * example a lazy import in an event handler or a failed `<script>` load.
 */
export function ChunkReloadGuard() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      recoverFromChunkError(event.error ?? event.message);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      recoverFromChunkError(event.reason);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
