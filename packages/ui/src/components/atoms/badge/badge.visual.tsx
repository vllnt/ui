import { expect, test } from "@playwright/experimental-ct-react";

import { Badge } from "./badge";

test.describe("Badge Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<Badge>Test</Badge>);
    await expect(component).toHaveScreenshot("badge-default.png");
  });

  test("variant-destructive", async ({ mount }) => {
    const component = await mount(<Badge variant="destructive">Test</Badge>);
    await expect(component).toHaveScreenshot("badge-variant-destructive.png");
  });

  test("variant-outline", async ({ mount }) => {
    const component = await mount(<Badge variant="outline">Test</Badge>);
    await expect(component).toHaveScreenshot("badge-variant-outline.png");
  });

  test("variant-secondary", async ({ mount }) => {
    const component = await mount(<Badge variant="secondary">Test</Badge>);
    await expect(component).toHaveScreenshot("badge-variant-secondary.png");
  });
});
