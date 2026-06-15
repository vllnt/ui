"use client";

import { ProgressBar } from "@vllnt/ui";

export default function ProgressBarPreview() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <ProgressBar
        completedLabel="items"
        currentLabel="Progress"
        max={10}
        value={3}
      />
      <ProgressBar currentLabel="Complete!" isComplete max={10} value={10} />
    </div>
  );
}
