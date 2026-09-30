import { expect, test } from "@playwright/experimental-ct-react";

import { VideoEmbed } from "./video-embed";

test.describe("VideoEmbed Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<VideoEmbed />);
    await expect(page).toHaveScreenshot("video-embed-default.png");
  });
});
