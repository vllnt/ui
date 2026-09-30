import { expect, test } from "@playwright/experimental-ct-react";

import { AvatarGroup } from "./avatar-group";

test.describe("AvatarGroup Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <AvatarGroup
        items={[
          { alt: "Ada Lovelace", fallback: "AL" },
          { alt: "Grace Hopper", fallback: "GH" },
          { alt: "Margaret Hamilton", fallback: "MH" },
          { alt: "Katherine Johnson", fallback: "KJ" },
        ]}
        max={3}
      />,
    );

    await expect(page).toHaveScreenshot("avatar-group-default.png");
  });
});