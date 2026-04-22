import { expect, test } from "@playwright/experimental-ct-react";

import { Input } from "./input";

test.describe("Input Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<Input placeholder="Enter text..." />);
    await expect(component).toHaveScreenshot("input-default.png");
  });

  test("disabled", async ({ mount }) => {
    const component = await mount(
      <Input disabled placeholder="Disabled input" />,
    );
    await expect(component).toHaveScreenshot("input-disabled.png");
  });

  test("focus-visible", async ({ mount, page }) => {
    const component = await mount(<Input placeholder="Focus me..." />);
    await component.click();
    await expect(component).toHaveScreenshot("input-focus.png");
  });

  test("with-value", async ({ mount }) => {
    const component = await mount(
      <Input defaultValue="Hello World" placeholder="Enter text..." />,
    );
    await expect(component).toHaveScreenshot("input-with-value.png");
  });
});
