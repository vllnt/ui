import { expect, test } from "@playwright/experimental-ct-react";

import { Callout, CalloutBody, CalloutHeader } from "./callout";

test.describe("Callout Visual", () => {
  for (const theme of ["light", "dark"]) {
    test(`neutral composition ${theme}`, async ({ mount }) => {
      const component = await mount(
        <div className={theme}>
          <Callout composable variant="neutral" role="note">
            <CalloutHeader>
              <h2>Before you begin</h2>
            </CalloutHeader>
            <CalloutBody>
              <p>Neutral content inherits consumer typography.</p>
            </CalloutBody>
          </Callout>
        </div>,
      );
      await expect(component.getByRole("note")).toBeVisible();
      await expect(component).toHaveScreenshot(`callout-neutral-${theme}.png`);
    });
  }
  test("default", async ({ mount, page }) => {
    await mount(<Callout>Test</Callout>);
    await expect(page).toHaveScreenshot("callout-default.png");
  });
});
