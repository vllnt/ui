"use client";

import { Marquee } from "@vllnt/ui";

export default function MarqueePreview() {
  return (
    <div className="w-full max-w-lg rounded-lg border p-4">
      <Marquee>
        <span className="rounded-md border bg-muted px-3 py-2 text-sm">
          Alpha
        </span>
        <span className="rounded-md border bg-muted px-3 py-2 text-sm">
          Beta
        </span>
        <span className="rounded-md border bg-muted px-3 py-2 text-sm">
          Gamma
        </span>
      </Marquee>
    </div>
  );
}
