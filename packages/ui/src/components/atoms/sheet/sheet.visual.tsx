import { expect, test } from "@playwright/experimental-ct-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

test.describe("Sheet Visual", () => {
  test("close button is at least 24x24 around a 16px icon", async ({
    mount,
    page,
  }) => {
    await mount(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description content.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const close = page.getByRole("button", { exact: true, name: "Close" });
    const target = await close.evaluate((element) => ({
      height: element.clientHeight,
      width: element.clientWidth,
    }));
    const iconWidth = await close
      .locator("svg")
      .evaluate((element) => getComputedStyle(element).width);

    expect(target.width).toBeGreaterThanOrEqual(24);
    expect(target.height).toBeGreaterThanOrEqual(24);
    expect(iconWidth).toBe("16px");
  });

  test("default", async ({ mount, page }) => {
    await mount(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description content.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await expect(page).toHaveScreenshot("sheet-default.png");
  });

  test("side-bottom", async ({ mount, page }) => {
    await mount(
      <Sheet open>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
            <SheetDescription>Bottom sheet content.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await expect(page).toHaveScreenshot("sheet-side-bottom.png");
  });

  test("side-left", async ({ mount, page }) => {
    await mount(
      <Sheet open>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
            <SheetDescription>Left sheet content.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await expect(page).toHaveScreenshot("sheet-side-left.png");
  });

  test("side-top", async ({ mount, page }) => {
    await mount(
      <Sheet open>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Top Sheet</SheetTitle>
            <SheetDescription>Top sheet content.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await expect(page).toHaveScreenshot("sheet-side-top.png");
  });
});
