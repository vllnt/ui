import { expect, test } from "@playwright/experimental-ct-react";

import {
  GeographyQuizMap,
  GeographyQuizMapPrompt,
  GeographyQuizMapScore,
  type QuizQuestion,
  type QuizRegion,
} from "./geography-quiz-map";

const REGIONS: QuizRegion[] = [
  {
    coordinates: [
      [-5, 51],
      [10, 51],
      [10, 41],
      [-5, 41],
      [-5, 51],
    ],
    id: "FR",
    name: "France",
  },
  {
    coordinates: [
      [5, 55],
      [15, 55],
      [15, 47],
      [5, 47],
      [5, 55],
    ],
    id: "DE",
    name: "Germany",
  },
  {
    coordinates: [
      [-9, 44],
      [3, 44],
      [3, 36],
      [-9, 36],
      [-9, 44],
    ],
    id: "ES",
    name: "Spain",
  },
  {
    coordinates: [
      [6, 47],
      [18, 47],
      [18, 37],
      [6, 37],
      [6, 47],
    ],
    id: "IT",
    name: "Italy",
  },
];

const QUESTIONS: QuizQuestion[] = [
  { answerRegionId: "FR", id: "q1", prompt: "Click on France" },
  { answerRegionId: "DE", id: "q2", prompt: "Click on Germany" },
  { answerRegionId: "ES", id: "q3", prompt: "Click on Spain" },
];

test.describe("GeographyQuizMap Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <GeographyQuizMap questions={QUESTIONS} regions={REGIONS}>
        <GeographyQuizMapPrompt />
        <GeographyQuizMapScore />
      </GeographyQuizMap>,
    );
    await expect(component).toHaveScreenshot(
      "geography-quiz-map-default.png",
    );
  });
});
