"use client";

import { MetricGauge } from "@vllnt/ui";

export default function MetricGaugePreview() {
  return (
    <div className="w-full max-w-sm">
      <MetricGauge label="CPU load" max={100} unit="%" value={72} />
    </div>
  );
}
