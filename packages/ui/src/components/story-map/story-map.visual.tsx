import { expect, test } from "@playwright/experimental-ct-react";

import { StoryMap, StoryMapChapter } from "./story-map";

test.describe("StoryMap Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <StoryMap>
        <StoryMapChapter
          center={[12.49, 41.89]}
          color="red"
          id="rome"
          subtitle="476 AD"
          title="The Fall of Rome"
          zoom={3}
        >
          <p>
            In 476 AD, the last Western Roman Emperor was deposed, ending
            centuries of Roman political dominance.
          </p>
        </StoryMapChapter>
        <StoryMapChapter
          center={[28.98, 41.01]}
          color="purple"
          id="constantinople"
          subtitle="476 – 1453"
          title="Constantinople Endures"
          zoom={3}
        >
          <p>
            While Rome fell, Constantinople thrived as the capital of the
            Byzantine Empire for nearly a thousand more years.
          </p>
        </StoryMapChapter>
      </StoryMap>,
    );
    await expect(component).toHaveScreenshot("story-map-default.png");
  });
});
