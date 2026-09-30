import { expect, test } from "@playwright/experimental-ct-react";

import { NewsletterSignup } from "./newsletter-signup";

const noop = (): void => {
  return;
};

test.describe("NewsletterSignup Visual", () => {
  test("idle-inline", async ({ mount }) => {
    const component = await mount(<NewsletterSignup onSubmit={noop} />);
    await expect(component).toHaveScreenshot("newsletter-signup-idle-inline.png");
  });

  test("idle-stacked", async ({ mount }) => {
    const component = await mount(
      <NewsletterSignup onSubmit={noop} variant="stacked" />,
    );
    await expect(component).toHaveScreenshot(
      "newsletter-signup-idle-stacked.png",
    );
  });
});
