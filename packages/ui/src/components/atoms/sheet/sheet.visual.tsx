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

  test("close button hit area and focus ring", async ({ mount, page }) => {
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
    const close = page.getByRole("button", { name: "Close" });
    const box = await close.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
    await close.focus();
    await expect(close).toBeFocused();
    expect(
      await close.evaluate((element) => getComputedStyle(element).boxShadow),
    ).not.toBe("none");
    await expect(page).toHaveScreenshot("sheet-close-focus.png");
  });

  test("custom close label", async ({ mount, page }) => {
    await mount(
      <Sheet open>
        <SheetContent labels={{ close: "Fermer" }}>
          <SheetHeader>
            <SheetTitle>Panneau</SheetTitle>
            <SheetDescription>Contenu du panneau.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const close = page.getByRole("button", { name: "Fermer" });
    await expect(close).toBeVisible();
    const box = await close.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
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
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("sheet-mobile.png");
    expect(errors).toEqual([]);
  });
});
