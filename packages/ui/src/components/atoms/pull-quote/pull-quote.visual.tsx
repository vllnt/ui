import { expect, test } from "@playwright/experimental-ct-react";

import { PullQuote } from "./pull-quote";

const quote = "A good design system is the one your team forgets they use.";
const cite = "Ada Lovelace, Notes on the Engine";

test.describe("PullQuote Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<PullQuote cite={cite}>{quote}</PullQuote>);
    await expect(component).toHaveScreenshot("pull-quote-default.png");
  });

  test("size-lg", async ({ mount }) => {
    const component = await mount(
      <PullQuote cite={cite} size="lg">
        {quote}
      </PullQuote>,
    );
    await expect(component).toHaveScreenshot("pull-quote-size-lg.png");
  });

  test("without-cite", async ({ mount }) => {
    const component = await mount(<PullQuote>{quote}</PullQuote>);
    await expect(component).toHaveScreenshot("pull-quote-without-cite.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    await page.setViewportSize({ height: 844, width: 390 });
    await mount(
      <PullQuote cite={cite} size="lg">
        {quote}
      </PullQuote>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("pull-quote-mobile.png");
    expect(errors).toEqual([]);
  });
});
