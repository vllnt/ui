"use client";

import { Separator } from "@vllnt/ui";

export default function SeparatorPreview() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">VLLNT UI</h4>
        <p className="text-sm text-muted-foreground">A component library.</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-x-4 text-sm">
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
        <Separator orientation="vertical" />
        <div>Support</div>
      </div>
    </div>
  );
}
