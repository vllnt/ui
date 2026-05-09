import { expect, test } from "@playwright/experimental-ct-react";

import {
  CivilizationCard,
  CivilizationComparison,
} from "./civilization-card";

const ROME = {
  achievements: ["Aqueducts", "Roads", "Law", "Architecture"],
  capital: "Rome",
  color: "red" as const,
  era: { end: 476, start: -27 },
  leaders: ["Augustus", "Trajan", "Marcus Aurelius"],
  name: "Roman Empire",
  peakPopulation: "70 million",
  region: "Mediterranean",
};

const HAN = {
  achievements: ["Paper", "Silk Road", "Bureaucracy"],
  capital: "Chang'an",
  color: "amber" as const,
  era: { end: 220, start: -202 },
  leaders: ["Liu Bang", "Wu of Han"],
  name: "Han Dynasty",
  peakPopulation: "60 million",
  region: "East Asia",
};

test.describe("CivilizationCard Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<CivilizationCard {...ROME} />);
    await expect(component).toHaveScreenshot("civilization-card-default.png");
  });

  test("comparison", async ({ mount }) => {
    const component = await mount(
      <CivilizationComparison>
        <CivilizationCard {...ROME} />
        <CivilizationCard {...HAN} />
      </CivilizationComparison>,
    );
    await expect(component).toHaveScreenshot(
      "civilization-card-comparison.png",
    );
  });

  test("minimal", async ({ mount }) => {
    const component = await mount(
      <CivilizationCard era={{ start: 1776 }} name="USA" />,
    );
    await expect(component).toHaveScreenshot("civilization-card-minimal.png");
  });
});
