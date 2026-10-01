import { expect, test } from "@playwright/experimental-ct-react";

import { HistoricalFigureCard } from "./historical-figure-card";

const FIGURE = {
  birth: { place: "Vinci, Italy", year: 1452 },
  death: { place: "Amboise, France", year: 1519 },
  era: "Renaissance",
  fields: ["Art", "Science", "Engineering", "Anatomy"],
  name: "Leonardo da Vinci",
  quote: {
    source: "Notebooks",
    text: "Learning never exhausts the mind.",
  },
  title: "Polymath",
  works: ["Mona Lisa", "Vitruvian Man"],
};

test.describe("HistoricalFigureCard Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<HistoricalFigureCard {...FIGURE} />);
    await expect(component).toHaveScreenshot(
      "historical-figure-card-default.png",
    );
  });

  test("with-connections", async ({ mount }) => {
    const component = await mount(
      <HistoricalFigureCard
        {...FIGURE}
        connections={[
          { name: "Michelangelo", relation: "Contemporary/rival" },
          { name: "Lorenzo de Medici", relation: "Patron" },
        ]}
        profileHref="/figures/da-vinci"
      />,
    );
    await expect(component).toHaveScreenshot(
      "historical-figure-card-with-connections.png",
    );
  });

  test("minimal", async ({ mount }) => {
    const component = await mount(
      <HistoricalFigureCard name="Marie Curie" title="Physicist" />,
    );
    await expect(component).toHaveScreenshot(
      "historical-figure-card-minimal.png",
    );
  });
});
