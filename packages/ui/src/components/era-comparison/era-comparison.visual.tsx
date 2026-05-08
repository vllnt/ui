import { expect, test } from "@playwright/experimental-ct-react";

import {
  EraColumn,
  EraComparison,
  EraDomain,
  EraFigure,
  EraHighlight,
} from "./era-comparison";

test.describe("EraComparison Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <EraComparison>
        <EraColumn
          color="amber"
          name="Renaissance"
          period="1400–1600"
          region="Europe"
        >
          <EraDomain name="Art">
            <EraHighlight>Perspective painting, humanism</EraHighlight>
            <div className="flex flex-wrap gap-1.5">
              <EraFigure name="Leonardo da Vinci" />
              <EraFigure name="Michelangelo" />
            </div>
          </EraDomain>
          <EraDomain name="Science">
            <EraHighlight>Heliocentrism, anatomy</EraHighlight>
            <div className="flex flex-wrap gap-1.5">
              <EraFigure name="Copernicus" />
              <EraFigure name="Galileo" />
            </div>
          </EraDomain>
        </EraColumn>
        <EraColumn
          color="emerald"
          name="Islamic Golden Age"
          period="800–1400"
          region="Middle East"
        >
          <EraDomain name="Art">
            <EraHighlight>Geometric patterns, calligraphy</EraHighlight>
          </EraDomain>
          <EraDomain name="Science">
            <EraHighlight>Algebra, optics, astronomy</EraHighlight>
            <div className="flex flex-wrap gap-1.5">
              <EraFigure name="Al-Khwarizmi" />
              <EraFigure name="Ibn al-Haytham" />
            </div>
          </EraDomain>
        </EraColumn>
      </EraComparison>,
    );
    await expect(component).toHaveScreenshot("era-comparison-default.png");
  });
});
