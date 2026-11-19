import {
  expect,
  type MountResult,
  test,
} from "@playwright/experimental-ct-react";

import { CookieConsent } from "./cookie-consent";

const BAR_PADDING_PX = 16;

/**
 * Waits for the bar to settle on the bottom edge and checks its bottom padding.
 * The mounted component is the dialog root itself.
 */
async function expectBarSettledWithPadding(
  component: MountResult,
  viewportHeight: number,
): Promise<void> {
  await expect
    .poll(async () => {
      const box = await component.boundingBox();
      return box ? Math.round(box.y + box.height) : -1;
    })
    .toBe(viewportHeight);
  const dialogBox = await component.boundingBox();
  const acceptBox = await component
    .getByRole("button", { name: "Accept" })
    .boundingBox();
  if (!dialogBox || !acceptBox) throw new Error("Missing bar geometry");
  expect(
    dialogBox.y + dialogBox.height - (acceptBox.y + acceptBox.height),
  ).toBeGreaterThanOrEqual(BAR_PADDING_PX);
}

test.describe("CookieConsent", () => {
  test("bottom-left position", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-left"
      />,
    );
    await expect(component).toHaveScreenshot();
  });

  test("bottom-center position", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-center"
      />,
    );
    await expect(component).toHaveScreenshot();
  });

  test("bottom-right position", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-right"
      />,
    );
    await expect(component).toHaveScreenshot();
  });

  test("with decline button", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        declineText="Decline"
        message="We use cookies"
        open={true}
        position="bottom-left"
      />,
    );
    await expect(component).toHaveScreenshot();
  });

  test("with settings link", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-left"
        settingsHref="/privacy"
        settingsText="Learn more"
      />,
    );
    await expect(component).toHaveScreenshot();
  });

  test("with close button", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        message="We use cookies"
        open={true}
        position="bottom-left"
        showCloseButton={true}
      />,
    );
    await expect(component).toHaveScreenshot();
  });

  test("with title", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        declineText="Decline"
        message="We use cookies"
        open={true}
        title="Audience measurement"
      />,
    );
    await expect(component).toHaveScreenshot("cookie-consent-title.png");
  });

  test("equal actions", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        actions="equal"
        declineText="Decline"
        message="We use cookies"
        open={true}
      />,
    );
    await expect(component).toHaveScreenshot("cookie-consent-equal.png");
  });

  test("bar layout", async ({ mount }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        declineText="Decline"
        layout="bar"
        message="We use cookies"
        open={true}
        settingsHref="/privacy"
        settingsText="Privacy"
      />,
    );
    await expect(component).toHaveScreenshot("cookie-consent-bar.png");
  });

  test("bar layout with title, equal actions and close button", async ({
    mount,
  }) => {
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        actions="equal"
        declineText="Decline"
        layout="bar"
        message="We measure audience with privacy-friendly analytics."
        open={true}
        settingsHref="/privacy"
        settingsText="Privacy"
        showCloseButton={true}
        title="Audience measurement"
      />,
    );
    await expect(component).toHaveScreenshot("cookie-consent-bar-full.png");
  });

  test("desktop 1280", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    await page.setViewportSize({ height: 720, width: 1280 });
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        actions="equal"
        declineText="Decline"
        layout="bar"
        message="We measure audience with privacy-friendly analytics."
        open={true}
        settingsHref="/privacy"
        settingsText="Privacy"
        title="Audience measurement"
      />,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expectBarSettledWithPadding(component, 720);
    await expect(page).toHaveScreenshot("cookie-consent-desktop.png");
    expect(errors).toEqual([]);
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    await page.setViewportSize({ height: 844, width: 390 });
    const component = await mount(
      <CookieConsent
        acceptText="Accept"
        actions="equal"
        declineText="Decline"
        layout="bar"
        message="We measure audience with privacy-friendly analytics."
        open={true}
        settingsHref="/privacy"
        settingsText="Privacy"
        showCloseButton={true}
        title="Audience measurement"
      />,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expectBarSettledWithPadding(component, 844);
    await expect(page).toHaveScreenshot("cookie-consent-mobile.png");
    expect(errors).toEqual([]);
  });
});
