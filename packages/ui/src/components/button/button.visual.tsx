import { expect, test } from "@playwright/experimental-ct-react";

import { Button } from "./button";

test.describe("Button Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<Button>Test</Button>);
    await expect(component).toHaveScreenshot("button-default.png");
  });

  test("size-icon", async ({ mount }) => {
    const component = await mount(<Button size="icon">T</Button>);
    await expect(component).toHaveScreenshot("button-size-icon.png");
  });

  test("size-lg", async ({ mount }) => {
    const component = await mount(<Button size="lg">Test</Button>);
    await expect(component).toHaveScreenshot("button-size-lg.png");
  });

  test("size-sm", async ({ mount }) => {
    const component = await mount(<Button size="sm">Test</Button>);
    await expect(component).toHaveScreenshot("button-size-sm.png");
  });

  test("variant-destructive", async ({ mount }) => {
    const component = await mount(<Button variant="destructive">Test</Button>);
    await expect(component).toHaveScreenshot("button-variant-destructive.png");
  });

  test("variant-ghost", async ({ mount }) => {
    const component = await mount(<Button variant="ghost">Test</Button>);
    await expect(component).toHaveScreenshot("button-variant-ghost.png");
  });

  test("variant-link", async ({ mount }) => {
    const component = await mount(<Button variant="link">Test</Button>);
    await expect(component).toHaveScreenshot("button-variant-link.png");
  });

  test("variant-outline", async ({ mount }) => {
    const component = await mount(<Button variant="outline">Test</Button>);
    await expect(component).toHaveScreenshot("button-variant-outline.png");
  });

  test("variant-secondary", async ({ mount }) => {
    const component = await mount(<Button variant="secondary">Test</Button>);
    await expect(component).toHaveScreenshot("button-variant-secondary.png");
  });

  test("disabled", async ({ mount }) => {
    const component = await mount(<Button disabled>Disabled</Button>);
    await expect(component).toHaveScreenshot("button-disabled.png");
  });

  test("focus-visible", async ({ mount, page }) => {
    const component = await mount(<Button>Focus Me</Button>);
    await page.keyboard.press("Tab");
    await expect(component).toHaveScreenshot("button-focus-visible.png");
  });
});
