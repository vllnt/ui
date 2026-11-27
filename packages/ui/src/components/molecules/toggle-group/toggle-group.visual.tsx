import { expect, test } from "@playwright/experimental-ct-react";

import { ToggleGroup } from "./toggle-group";
import {
  UnstyledToggleGroup,
  UnstyledToggleGroupItem,
} from "./unstyled-toggle-group";

test.describe("ToggleGroup Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ToggleGroup />);
    await expect(page).toHaveScreenshot("toggle-group-default.png");
  });
  test("unstyled", async ({ mount, page }) => {
    await mount(
      <UnstyledToggleGroup aria-label="View" defaultValue="a" type="single">
        <UnstyledToggleGroupItem value="a">A</UnstyledToggleGroupItem>
        <UnstyledToggleGroupItem value="b">B</UnstyledToggleGroupItem>
      </UnstyledToggleGroup>,
    );
    await expect(page).toHaveScreenshot("toggle-group-unstyled.png");
  });
});
