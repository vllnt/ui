"use client";

import { StatusBoard } from "@vllnt/ui";

export default function StatusBoardPreview() {
  return (
    <StatusBoard
      items={[
        {
          description: "Traffic and auth requests are stable.",
          label: "Gateway",
          meta: "1m ago",
          status: "healthy",
          value: "99.98%",
        },
        {
          description: "Queue depth is trending upward.",
          label: "Worker pool",
          meta: "4 delayed jobs",
          status: "warning",
          value: "82%",
        },
        {
          description: "Fallback region currently disabled.",
          label: "Edge POP",
          meta: "Planned maintenance",
          status: "maintenance",
          value: "2/3 online",
        },
      ]}
      title="Service health"
    />
  );
}
