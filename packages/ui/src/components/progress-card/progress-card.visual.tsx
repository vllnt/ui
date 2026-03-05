import { expect, test } from "@playwright/experimental-ct-react";

import { ContentCard } from "./progress-card";

test.describe("ContentCard Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ContentCard />);
    await expect(page).toHaveScreenshot("progress-card-default.png");
  });
});
