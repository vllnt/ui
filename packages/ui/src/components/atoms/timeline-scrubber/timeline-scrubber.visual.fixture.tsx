import { useState } from "react";

import { TimelineScrubber } from "./timeline-scrubber";

function minutes(value: number): string {
  return `${Math.round(value / 60)}m`;
}

/**
 * Keeps `formatValue` in the browser: Playwright CT runs a function prop in the
 * test runner and returns a promise, so a render-time formatter cannot be one.
 */
export function TimelineScrubberPreview() {
  const [value, setValue] = useState(1800);

  return (
    <div className="w-72 bg-muted/30 p-4">
      <TimelineScrubber
        end={3600}
        formatValue={minutes}
        onValueChange={setValue}
        start={0}
        ticks={[
          { id: "deploy", tone: "primary", value: 600 },
          { id: "alert", tone: "danger", value: 2400 },
        ]}
        value={value}
      />
    </div>
  );
}
