import { expect, test } from "@playwright/experimental-ct-react";

import { Banner, BannerAction } from "./banner";

test.describe("Banner Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<Banner>Your trial expires in 3 days.</Banner>);
    await expect(component).toHaveScreenshot("banner-default.png");
  });

  test("variant-warning", async ({ mount }) => {
    const component = await mount(
      <Banner variant="warning">
        Scheduled maintenance tonight at 11pm UTC.
      </Banner>,
    );
    await expect(component).toHaveScreenshot("banner-variant-warning.png");
  });

  test("variant-success", async ({ mount }) => {
    const component = await mount(
      <Banner variant="success">Your account has been upgraded!</Banner>,
    );
    await expect(component).toHaveScreenshot("banner-variant-success.png");
  });

  test("variant-destructive", async ({ mount }) => {
    const component = await mount(
      <Banner variant="destructive">Payment failed. Update billing info.</Banner>,
    );
    await expect(component).toHaveScreenshot("banner-variant-destructive.png");
  });

  test("with-action", async ({ mount }) => {
    const component = await mount(
      <Banner dismissible variant="warning">
        Your trial expires in 3 days.
        <BannerAction>Upgrade now</BannerAction>
      </Banner>,
    );
    await expect(component).toHaveScreenshot("banner-with-action.png");
  });
});
