"use client";

import { Textarea } from "@vllnt/ui";

export default function TextareaPreview() {
  return (
    <div className="w-full max-w-sm">
      <Textarea placeholder="Type your message here..." />
    </div>
  );
}
