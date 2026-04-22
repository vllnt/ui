import { expect, test } from "@playwright/experimental-ct-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

test.describe("Sheet Visual", () => {
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
