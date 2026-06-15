"use client";

import { CountdownTimer } from "@vllnt/ui";

export default function CountdownTimerPreview() {
  return (
    <div className="w-full max-w-sm">
      <CountdownTimer
        deadline="2026-03-15T10:30:00.000Z"
        now="2026-03-15T10:00:00.000Z"
        startedAt="2026-03-15T09:00:00.000Z"
        title="SLA timer"
      />
    </div>
  );
}
