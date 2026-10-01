import { expect, test } from "@playwright/experimental-ct-react";

import { TagsInput } from "./tags-input";

test.describe("TagsInput Visual", () => {
  test("default tags", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <TagsInput aria-label="Framework tags" defaultValue={["React", "Vue", "Svelte"]} />
      </div>,
    );

    await expect(page).toHaveScreenshot("tags-input-default-tags.png");
  });
});
