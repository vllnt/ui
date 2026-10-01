import { expect, test } from "@playwright/experimental-ct-react";

import { StatusBoard, type StatusBoardItem } from "./status-board";

const items: StatusBoardItem[] = [
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
    meta: "Planned work",
    status: "maintenance",
    value: "2/3 online",
  },
];

test.describe("StatusBoard Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<StatusBoard items={items} title="Service health" />);
    await expect(page).toHaveScreenshot("status-board-default.png");
  });
});
