"use client";

import { useEffect } from "react";

import { recoverFromChunkError } from "@/lib/chunk-reload";

type Props = {
  readonly error: Error & { digest?: string };
};

/**
 * Last-resort boundary, used when the root layout itself fails. It renders
 * its own document and no providers, so the copy is plain English.
 */
export default function GlobalError({ error }: Props) {
  useEffect(() => {
    recoverFromChunkError(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#000",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          padding: "6rem 1rem",
        }}
      >
        <main style={{ margin: "0 auto", maxWidth: "40rem" }}>
          <h1>Something went wrong</h1>
          <p>This page failed to load. Reloading usually fixes it.</p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            style={{ minHeight: 44, padding: "0 1rem" }}
            type="button"
          >
            Reload the page
          </button>
        </main>
      </body>
    </html>
  );
}
