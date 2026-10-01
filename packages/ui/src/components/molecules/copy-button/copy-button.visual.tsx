import { expect, test } from "@playwright/experimental-ct-react";

import { CopyButton } from "./copy-button";

test.describe("CopyButton Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<CopyButton value="EXAMPLE_API_KEY" />);
    await expect(component).toHaveScreenshot("copy-button-default.png");
  });

  test("variant-inline", async ({ mount }) => {
    const component = await mount(
      <CopyButton value="usr_42" variant="inline" />,
    );
    await expect(component).toHaveScreenshot("copy-button-variant-inline.png");
  });

  test("variant-button", async ({ mount }) => {
    const component = await mount(
      <CopyButton label="Copy link" value="https://ui.vllnt.com" variant="button" />,
    );
    await expect(component).toHaveScreenshot("copy-button-variant-button.png");
  });
});
