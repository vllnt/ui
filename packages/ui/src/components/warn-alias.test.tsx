import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { AlertPulse } from "./atoms/alert-pulse/alert-pulse";
import { BottomActivityStrip } from "./atoms/bottom-activity-strip/bottom-activity-strip";
import { HeatOverlay } from "./atoms/heat-overlay/heat-overlay";
import { MetricCluster } from "./atoms/metric-cluster/metric-cluster";
import { RuntimeOverviewPanel } from "./atoms/runtime-overview-panel/runtime-overview-panel";
import { StickyMetric } from "./atoms/sticky-metric/sticky-metric";
import { ThresholdRing } from "./atoms/threshold-ring/threshold-ring";
import { TimelineScrubber } from "./atoms/timeline-scrubber/timeline-scrubber";

type WarnSpelling = "warn" | "warning";

const CASES: readonly (readonly [
  string,
  (tone: WarnSpelling) => ReactElement,
])[] = [
  ["AlertPulse", (tone) => <AlertPulse cx={10} cy={10} severity={tone} />],
  [
    "BottomActivityStrip",
    (tone) => (
      <BottomActivityStrip
        events={[{ id: "1", label: "queue spike", tone, ts: "1m" }]}
      />
    ),
  ],
  [
    "HeatOverlay",
    (tone) => (
      <HeatOverlay
        defaultTone={tone}
        points={[{ id: "a", weight: 1, x: 10, y: 10 }]}
      />
    ),
  ],
  [
    "MetricCluster",
    (tone) => (
      <MetricCluster
        metrics={[{ id: "qps", label: "qps", tone, value: "240" }]}
        x={0}
        y={0}
      />
    ),
  ],
  [
    "RuntimeOverviewPanel",
    (tone) => (
      <RuntimeOverviewPanel
        metrics={[{ id: "runs", label: "Runs", tone, value: 3 }]}
      />
    ),
  ],
  [
    "StickyMetric",
    (tone) => <StickyMetric label="errs" tone={tone} value="14" x={0} y={0} />,
  ],
  ["ThresholdRing", (tone) => <ThresholdRing tone={tone} value={0.5} />],
  [
    "TimelineScrubber",
    (tone) => (
      <TimelineScrubber
        end={100}
        onValueChange={vi.fn()}
        start={0}
        tone={tone}
        value={25}
      />
    ),
  ],
];

function countWarningColour(element: ReactElement): number {
  const { container } = render(element);
  return container.innerHTML.match(/amber-500/g)?.length ?? 0;
}

describe("warn and warning tones", () => {
  it.each(CASES)(
    "%s draws the same warning colour for warn and warning",
    (_name, build) => {
      const withWarn = countWarningColour(build("warn"));
      expect(withWarn).toBeGreaterThan(0);
      expect(countWarningColour(build("warning"))).toBe(withWarn);
    },
  );
});
