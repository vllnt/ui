"use client";

import { ActivityHeatmap } from "@vllnt/ui";

export default function ActivityHeatmapPreview() {
  return (
    <ActivityHeatmap
      data={[
        { count: 1, date: "2026-03-01" },
        { count: 3, date: "2026-03-02" },
        { count: 6, date: "2026-03-03" },
        { count: 4, date: "2026-03-05" },
        { count: 9, date: "2026-03-08" },
        { count: 7, date: "2026-03-11" },
        { count: 2, date: "2026-03-13" },
      ]}
      endDate="2026-03-14T00:00:00.000Z"
      title="Deployment activity"
      weeks={2}
    />
  );
}
