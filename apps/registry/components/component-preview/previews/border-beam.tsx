"use client";

import { BorderBeam } from "@vllnt/ui";

export default function BorderBeamPreview() {
  return (
    <div className="relative w-full max-w-sm rounded-xl border bg-card p-6">
      <BorderBeam />
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Status</div>
        <div className="text-lg font-semibold">Live preview</div>
      </div>
    </div>
  );
}
