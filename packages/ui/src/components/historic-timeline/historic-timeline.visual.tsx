import { expect, test } from "@playwright/experimental-ct-react";

import {
  type HistoricCategory,
  type HistoricEra,
  type HistoricEvent,
  type HistoricPeriod,
  HistoricTimeline,
} from "./historic-timeline";

const ERAS: HistoricEra[] = [
  { color: "amber", endYear: 476, id: "ancient", name: "Ancient", startYear: -3000 },
  { color: "emerald", endYear: 1453, id: "medieval", name: "Medieval", startYear: 476 },
  { color: "blue", endYear: 2025, id: "modern", name: "Modern", startYear: 1453 },
];

const CATEGORIES: HistoricCategory[] = [
  { color: "amber", id: "culture", label: "Culture" },
  { color: "blue", id: "science", label: "Science" },
  { color: "red", id: "conflict", label: "Conflict" },
];

const EVENTS: HistoricEvent[] = [
  { category: "culture", id: "olympics", title: "First Olympics", year: -776 },
  { category: "culture", id: "rome-founded", title: "Rome founded", year: -753 },
  { category: "conflict", id: "fall-rome", title: "Fall of Western Rome", year: 476 },
  { category: "science", id: "press", title: "Printing press", year: 1450 },
  { category: "science", id: "moon", title: "Moon landing", year: 1969 },
];

const PERIODS: HistoricPeriod[] = [
  {
    category: "conflict",
    endYear: 1453,
    id: "100yr",
    startYear: 1337,
    title: "Hundred Years' War",
  },
];

test.describe("HistoricTimeline Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <HistoricTimeline
        categories={CATEGORIES}
        endYear={2025}
        eras={ERAS}
        events={EVENTS}
        periods={PERIODS}
        startYear={-3000}
      />,
    );
    await expect(component).toHaveScreenshot(
      "historic-timeline-default.png",
    );
  });
});
