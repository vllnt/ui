"use client";

import { StatusIndicator } from "@vllnt/ui";

export default function StatusIndicatorPreview() {
  return (
    <div className="flex flex-wrap gap-3">
      <StatusIndicator tone="success">Operational</StatusIndicator>
      <StatusIndicator tone="warning">Pending</StatusIndicator>
      <StatusIndicator tone="danger">Incident</StatusIndicator>
      <StatusIndicator tone="info">Queued</StatusIndicator>
    </div>
  );
}
