import {
  expect,
  type Locator,
  test,
} from "@playwright/experimental-ct-react";

import { Button } from "../../atoms/button/button";
import { CtaBand } from "./cta-band";

const DESCRIPTION = "Free for personal projects. No credit card required.";
const TITLE = "Ship your next release faster";

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("element has no layout box");
  }
  return box;
}

test.describe("CtaBand Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <CtaBand
        actions={
          <>
            <Button>Get started</Button>
            <Button variant="outline">Talk to sales</Button>
          </>
        }
        description={DESCRIPTION}
        title={TITLE}
      />,
    );
    await expect(page).toHaveScreenshot("cta-band-default.png");
  });

  test("muted", async ({ mount, page }) => {
    await mount(
      <CtaBand
        actions={<Button>Get started</Button>}
        description={DESCRIPTION}
        divider
        title={TITLE}
        tone="muted"
      />,
    );
    await expect(page).toHaveScreenshot("cta-band-muted.png");
  });

  test("muted on a phone", async ({ mount, page }) => {
    await page.setViewportSize({ height: 640, width: 375 });
    await mount(
      <CtaBand
        actions={
          <>
            <Button>Get started</Button>
            <Button variant="outline">Talk to sales</Button>
            <Button variant="ghost">Read the docs</Button>
          </>
        }
        description={DESCRIPTION}
        title={TITLE}
        tone="muted"
      />,
    );
    await expect(page).toHaveScreenshot("cta-band-muted-mobile.png");
  });
});

test.describe("CtaBand layout", () => {
  const actions = (
    <>
      <Button>Get started</Button>
      <Button variant="outline">Talk to sales</Button>
    </>
  );

  test("stacks the actions under the copy on a phone without overflow", async ({
    mount,
    page,
  }) => {
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        problems.push(message.text());
      }
    });
    await page.setViewportSize({ height: 800, width: 375 });
    await mount(
      <CtaBand actions={actions} description={DESCRIPTION} title={TITLE} />,
    );

    const heading = await boxOf(page.getByRole("heading", { name: TITLE }));
    const group = await boxOf(page.locator("[data-slot='cta-band-actions']"));
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(group.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    expect(overflows).toBe(false);
    expect(problems).toEqual([]);
  });

  test("places the actions beside the copy on desktop", async ({
    mount,
    page,
  }) => {
    await page.setViewportSize({ height: 800, width: 1280 });
    await mount(
      <CtaBand actions={actions} description={DESCRIPTION} title={TITLE} />,
    );

    const heading = await boxOf(page.getByRole("heading", { name: TITLE }));
    const group = await boxOf(page.locator("[data-slot='cta-band-actions']"));

    expect(group.x).toBeGreaterThanOrEqual(heading.x + heading.width);
    expect(group.y).toBeLessThan(heading.y + heading.height);
  });
});
