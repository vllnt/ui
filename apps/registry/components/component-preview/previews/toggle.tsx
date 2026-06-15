"use client";

import { Toggle } from "@vllnt/ui";
import { Bold, Italic, Underline } from "lucide-react";

export default function TogglePreview() {
  return (
    <div className="flex gap-2">
      <Toggle aria-label="Toggle bold">
        <Bold className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="size-4" />
      </Toggle>
    </div>
  );
}
