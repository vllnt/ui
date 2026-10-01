import { expect, test } from "@playwright/experimental-ct-react";

import { Kbd } from "./kbd";

test.describe("Kbd Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<Kbd>K</Kbd>);
    await expect(component).toHaveScreenshot("kbd-default.png");
  });

  test("size-sm", async ({ mount }) => {
    const component = await mount(<Kbd size="sm">K</Kbd>);
    await expect(component).toHaveScreenshot("kbd-size-sm.png");
  });

  test("size-lg", async ({ mount }) => {
    const component = await mount(<Kbd size="lg">K</Kbd>);
    await expect(component).toHaveScreenshot("kbd-size-lg.png");
  });

  test("shortcut", async ({ mount }) => {
    const component = await mount(<Kbd shortcut="ctrl+k" />);
    await expect(component).toHaveScreenshot("kbd-shortcut.png");
  });
});
