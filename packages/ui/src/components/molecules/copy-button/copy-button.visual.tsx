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

async function removeClipboardApi(page: Page): Promise<void> {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });
  expect(await page.evaluate(() => navigator.clipboard)).toBeUndefined();
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
          <CopyButton value="EXAMPLE_API_KEY" variant="button" />
          <textarea aria-label="Paste target" />
        </>,
      );
      await removeClipboardApi(page);

      await page.getByRole("button", { name: "Copy" }).click();
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
      await page.getByLabel("Paste target").press("ControlOrMeta+V");

      await expect(page.getByLabel("Paste target")).toHaveValue(
        "EXAMPLE_API_KEY",
      );
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
            <CopyButton value="EXAMPLE_API_KEY" variant="button" />
            <textarea aria-label="Paste target" />
          </DialogContent>
        </Dialog>,
      );
      await removeClipboardApi(page);

      await page.getByRole("button", { name: "Copy" }).click();
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
      await page.getByLabel("Paste target").press("ControlOrMeta+V");

      await expect(page.getByLabel("Paste target")).toHaveValue(
        "EXAMPLE_API_KEY",
      );
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
            <CopyButton value="EXAMPLE_API_KEY" variant="button" />
            <textarea aria-label="Paste target" />
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>,
      );
      await removeClipboardApi(page);

      await page.getByRole("button", { name: "Copy" }).click();
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
      await page.getByLabel("Paste target").press("ControlOrMeta+V");

      await expect(page.getByLabel("Paste target")).toHaveValue(
        "EXAMPLE_API_KEY",
      );
    });

    test("copies from inside a native modal dialog", async ({
      mount,
      page,
    }) => {
      await mount(
        <dialog>
          <CopyButton value="EXAMPLE_API_KEY" variant="button" />
          <textarea aria-label="Paste target" />
        </dialog>,
      );
      await page.evaluate(() => {
        document.querySelector("dialog")?.showModal();
      });
      await removeClipboardApi(page);

      await page.getByRole("button", { name: "Copy" }).click();
      await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
      await page.getByLabel("Paste target").press("ControlOrMeta+V");

      await expect(page.getByLabel("Paste target")).toHaveValue(
        "EXAMPLE_API_KEY",
      );
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
  });
});
