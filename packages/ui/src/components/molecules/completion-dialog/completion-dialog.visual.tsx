import { expect, test } from "@playwright/experimental-ct-react";

import { CompletionDialog } from "./completion-dialog";

test.describe("CompletionDialog Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<CompletionDialog />);
    await expect(page).toHaveScreenshot("completion-dialog-default.png");
  });

  test("close button is at least 24x24 around a 16px icon", async ({
    mount,
    page,
  }) => {
    await mount(
      <CompletionDialog
        isOpen
        onCancel={() => undefined}
        onClose={() => undefined}
        onConfirm={() => undefined}
        title="Done?"
      />,
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
});
