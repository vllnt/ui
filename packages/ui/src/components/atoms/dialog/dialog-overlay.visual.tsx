import { expect, test } from "@playwright/experimental-ct-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";

const OVERLAYS = ["scrim", "none"] as const;

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
        <div>
          <button type="button">Behind</button>
          <Dialog defaultOpen>
            <DialogContent overlay="none">
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogContent>
          </Dialog>
        </div>,
      );

      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.locator(".inset-0")).toHaveCount(0);
      await expect(page.locator('[role="dialog"]:focus-within')).toHaveCount(1);
      // Modal: everything outside the dialog is inert, so nothing behind it
      // takes a press or focus.
      const behindIsInert = await page
        .getByText("Behind")
        .evaluate((element) => element.closest("[inert]") !== null);
      expect(behindIsInert).toBe(true);

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
      expect(problems).toEqual([]);
    });

    for (const overlay of OVERLAYS) {
      test(`${overlay} locks page scroll until the dialog closes`, async ({
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
        const readScrollY = (): Promise<number> =>
          page.evaluate(() => window.scrollY);

        await mount(
          <div>
            <div style={{ height: 3000 }}>Page behind</div>
            <Dialog defaultOpen>
              <DialogContent overlay={overlay}>
                <DialogTitle>Title</DialogTitle>
                <DialogDescription>Description</DialogDescription>
              </DialogContent>
            </Dialog>
          </div>,
        );

        await expect(page.getByRole("dialog")).toBeVisible();
        const overflow = await page.evaluate(
          () => getComputedStyle(document.documentElement).overflow,
        );
        expect(overflow).toBe("hidden");

        await page.mouse.move(5, 5);
        await page.mouse.wheel(0, 800);
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              setTimeout(resolve, 400);
            }),
        );
        expect(await readScrollY()).toBe(0);

        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toBeHidden();

        await page.mouse.wheel(0, 800);
        await expect.poll(readScrollY).toBeGreaterThan(0);
        expect(problems).toEqual([]);
      });
    }
  });
}
