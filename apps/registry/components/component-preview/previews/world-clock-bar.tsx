"use client";

import { WorldClockBar } from "@vllnt/ui";

export default function WorldClockBarPreview() {
  return (
    <WorldClockBar
      now="2026-03-15T12:00:00.000Z"
      zones={[
        { city: "San Francisco", timeZone: "America/Los_Angeles" },
        { city: "New York", timeZone: "America/New_York" },
        { city: "London", timeZone: "Europe/London" },
        { city: "Singapore", timeZone: "Asia/Singapore" },
      ]}
    />
  );
}
