import { expect, test } from "@playwright/experimental-ct-react";
import type { Page } from "@playwright/test";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../atoms/dialog/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../alert-dialog/alert-dialog";
import { CopyButton } from "./copy-button";
import { CopyFromMenuPreview } from "./copy-button.visual.fixture";

const STALE_VALUE = "STALE_CLIPBOARD_VALUE";

async function removeClipboardApi(page: Page): Promise<void> {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });
  expect(await page.evaluate(() => navigator.clipboard)).toBeUndefined();
}

async function rejectClipboardAfter(page: Page, delay: number): Promise<void> {
  await page.evaluate((milliseconds) => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject(new Error("denied"));
            }, milliseconds);
          }),
      },
    });
  }, delay);
}

/**
 * Puts a known old value on the system clipboard. The clipboard outlives a
 * test, so a copy that silently fails would otherwise paste a value left by
 * an earlier run and still pass.
 */
async function seedStaleClipboard(page: Page): Promise<void> {
  const target = page.getByLabel("Paste target");
  await target.fill(STALE_VALUE);
  await target.press("ControlOrMeta+A");
  await target.press("ControlOrMeta+C");
  await target.fill("");
  await target.press("ControlOrMeta+V");
  await expect(target).toHaveValue(STALE_VALUE);
  await target.fill("");
}

async function expectPasted(page: Page, value: string): Promise<void> {
  const target = page.getByLabel("Paste target");
  await target.press("ControlOrMeta+V");
  await expect(target).toHaveValue(value);
}

async function copyThenExpectPasted(page: Page, value: string): Promise<void> {
  await seedStaleClipboard(page);
  await page.getByRole("button", { name: "Copy" }).click();
  await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
  await expectPasted(page, value);
}

test.describe("CopyButton Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<CopyButton value="EXAMPLE_API_KEY" />);
    await expect(component).toHaveScreenshot("copy-button-default.png");
  });

  test("variant-inline", async ({ mount }) => {
    const component = await mount(
      <CopyButton value="usr_42" variant="inline" />,
    );
    await expect(component).toHaveScreenshot("copy-button-variant-inline.png");
  });

  test("variant-button", async ({ mount }) => {
    const component = await mount(
      <CopyButton label="Copy link" value="https://ui.vllnt.com" variant="button" />,
    );
    await expect(component).toHaveScreenshot("copy-button-variant-button.png");
  });

  test.describe("without the Clipboard API (plain http)", () => {
    test("copies to the system clipboard", async ({ mount, page }) => {
      await mount(
        <>
          <CopyButton value="PAGE_KEY_2b9e" variant="button" />
          <textarea aria-label="Paste target" />
        </>,
      );
      await removeClipboardApi(page);

      await copyThenExpectPasted(page, "PAGE_KEY_2b9e");
    });

    test("copies from inside a modal dialog that traps focus", async ({
      mount,
      page,
    }) => {
      await mount(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Keys</DialogTitle>
            <DialogDescription>Copy the key.</DialogDescription>
            <CopyButton value="DIALOG_KEY_7f3a" variant="button" />
            <textarea aria-label="Paste target" />
          </DialogContent>
        </Dialog>,
      );
      await removeClipboardApi(page);

      await copyThenExpectPasted(page, "DIALOG_KEY_7f3a");
    });

    test("copies from a dialog when the click leaves focus on the dialog itself", async ({
      mount,
      page,
    }) => {
      await mount(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Keys</DialogTitle>
            <DialogDescription>Copy the key.</DialogDescription>
            <CopyButton value="SAFARI_KEY_e6b2" variant="button" />
            <textarea aria-label="Paste target" />
          </DialogContent>
        </Dialog>,
      );
      await removeClipboardApi(page);
      await seedStaleClipboard(page);
      await page.evaluate(() => {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
        const button = document.querySelector("button[aria-label='Copy']");
        if (!dialog || !button) throw new Error("missing dialog or button");
        button.addEventListener("mousedown", (event) => {
          event.preventDefault();
        });
        dialog.focus();
      });
      expect(
        await page.evaluate(() => document.activeElement?.getAttribute("role")),
      ).toBe("dialog");

      await page.getByRole("button", { name: "Copy" }).click();
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();

      await expectPasted(page, "SAFARI_KEY_e6b2");
    });

    test("copies from inside an alert dialog that traps focus", async ({
      mount,
      page,
    }) => {
      await mount(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle>Keys</AlertDialogTitle>
            <AlertDialogDescription>Copy the key.</AlertDialogDescription>
            <CopyButton value="ALERT_KEY_c41d" variant="button" />
            <textarea aria-label="Paste target" />
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>,
      );
      await removeClipboardApi(page);

      await copyThenExpectPasted(page, "ALERT_KEY_c41d");
    });

    test("copies from inside a native modal dialog", async ({
      mount,
      page,
    }) => {
      await mount(
        <dialog>
          <CopyButton value="NATIVE_KEY_95e0" variant="button" />
          <textarea aria-label="Paste target" />
        </dialog>,
      );
      await page.evaluate(() => {
        document.querySelector("dialog")?.showModal();
      });
      await removeClipboardApi(page);

      await copyThenExpectPasted(page, "NATIVE_KEY_95e0");
    });

    test("copies from a modal dropdown menu item", async ({ mount, page }) => {
      await mount(<CopyFromMenuPreview value="MENU_KEY_d8a6" />);
      await removeClipboardApi(page);
      await seedStaleClipboard(page);

      await page.getByRole("button", { name: "Actions" }).click();
      await page.getByRole("menuitem", { name: "Copy key" }).click();
      await expect(page.getByRole("menu")).toBeHidden();

      await expectPasted(page, "MENU_KEY_d8a6");
    });

    test("leaves no tooltip open after copying", async ({ mount, page }) => {
      await mount(<CopyButton value="EXAMPLE_API_KEY" />);
      await removeClipboardApi(page);
      const tooltip = page.locator('[role="tooltip"]');
      const button = page.getByRole("button", { name: "Copy" });

      await button.hover();
      await expect(tooltip).toHaveCount(1);
      await button.click();
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
      await page.mouse.move(5, 5);

      await expect(tooltip).toHaveCount(0);
    });

    test("keeps the text the user selected on the page", async ({
      mount,
      page,
    }) => {
      await mount(
        <>
          <p>Selected page text</p>
          <CopyButton value="EXAMPLE_API_KEY" variant="button" />
        </>,
      );
      await removeClipboardApi(page);
      await page.evaluate(() => {
        const paragraph = document.querySelector("p");
        if (!paragraph) throw new Error("missing paragraph");
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      });

      await page.getByRole("button", { name: "Copy" }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();

      expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(
        "Selected page text",
      );
    });

    test("gives keyboard focus back to the button after copying", async ({
      mount,
      page,
    }) => {
      await mount(<CopyButton value="EXAMPLE_API_KEY" variant="button" />);
      await removeClipboardApi(page);

      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Copy" })).toBeFocused();
      await page.keyboard.press("Enter");

      await expect(page.getByRole("button", { name: "Copied!" })).toBeFocused();
    });
  });

  test.describe("when the Clipboard API rejects late", () => {
    test("does not reopen the tooltip the pointer already left", async ({
      mount,
      page,
    }) => {
      await mount(<CopyButton value="EXAMPLE_API_KEY" />);
      await rejectClipboardAfter(page, 500);
      const tooltip = page.locator('[role="tooltip"]');
      const button = page.getByRole("button", { name: "Copy" });

      await button.hover();
      await expect(tooltip).toHaveCount(1);
      await button.click();
      await page.mouse.move(5, 5);
      await expect(tooltip).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();

      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
      await expect(tooltip).toHaveCount(0);
    });

    test("gives keyboard focus back to the button after copying", async ({
      mount,
      page,
    }) => {
      await mount(<CopyButton value="EXAMPLE_API_KEY" variant="button" />);
      await rejectClipboardAfter(page, 300);

      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Copy" })).toBeFocused();
      await page.keyboard.press("Enter");

      await expect(page.getByRole("button", { name: "Copied!" })).toBeFocused();
    });
  });
});
