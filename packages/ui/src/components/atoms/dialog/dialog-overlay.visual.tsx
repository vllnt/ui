import { expect, test } from "@playwright/experimental-ct-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";

// Real-browser check of DialogContent `overlay`: the scrim veil covers the
// viewport and dims the page, `none` draws no veil, and the dialog stays modal
// and dismissible with either value. No screenshots, so no baselines.
const viewports = [
  { height: 800, name: "desktop", width: 1280 },
  { height: 667, name: "mobile", width: 375 },
];

for (const viewport of viewports) {
  test.describe(`Dialog overlay at ${viewport.name} width`, () => {
    test.use({ viewport: { height: viewport.height, width: viewport.width } });

    test("scrim covers the viewport and Escape closes", async ({
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

      await mount(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      const veil = page.locator(".inset-0");
      await expect(veil).toHaveCount(1);
      const box = await veil.boundingBox();
      expect(box?.width).toBe(viewport.width);
      expect(box?.height).toBe(viewport.height);
      const background = await veil.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      expect(background).not.toBe("rgba(0, 0, 0, 0)");

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
      expect(problems).toEqual([]);
    });

    test("none draws no veil, stays modal, and Escape closes", async ({
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

      await mount(
        <Dialog defaultOpen>
          <DialogContent overlay="none">
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.locator(".inset-0")).toHaveCount(0);
      await expect(page.locator('[role="dialog"]:focus-within')).toHaveCount(1);
      const bodyPointerEvents = await page.evaluate(
        () => getComputedStyle(document.body).pointerEvents,
      );
      expect(bodyPointerEvents).toBe("none");

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
      expect(problems).toEqual([]);
    });
  });
}
