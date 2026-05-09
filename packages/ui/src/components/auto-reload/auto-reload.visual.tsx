import { expect, test } from "@playwright/experimental-ct-react";

import { AutoReload } from "./auto-reload";

test.describe("AutoReload Visual", () => {
  test("disabled-by-toggle", async ({ mount }) => {
    const component = await mount(<AutoReload currency="EUR" locale="en-IE" />);
    await expect(component).toHaveScreenshot("auto-reload-toggle-off.png");
  });

  test("enabled", async ({ mount }) => {
    const component = await mount(
      <AutoReload
        currency="EUR"
        defaultEnabled
        defaultReloadAmountCents={2000}
        defaultThresholdCents={1000}
        locale="en-IE"
      />,
    );
    await expect(component).toHaveScreenshot("auto-reload-toggle-on.png");
  });

  test("disabled-banner", async ({ mount }) => {
    const component = await mount(
      <AutoReload
        disabled
        disabledMessage="Subscribe to enable auto-reload settings."
      />,
    );
    await expect(component).toHaveScreenshot("auto-reload-disabled.png");
  });
});
