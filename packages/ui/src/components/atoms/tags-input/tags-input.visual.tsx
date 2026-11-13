import { expect, test } from "@playwright/experimental-ct-react";

import { TagsInput } from "./tags-input";

test.describe("TagsInput Visual", () => {
  test("default tags", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <TagsInput aria-label="Framework tags" defaultValue={["React", "Vue", "Svelte"]} />
      </div>,
    );

    await expect(page).toHaveScreenshot("tags-input-default-tags.png");
  });

  test("remove button hit area", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <TagsInput aria-label="Framework tags" defaultValue={["React", "Vue"]} />
      </div>,
    );
    const remove = page.getByRole("button", { name: "Remove React" });
    const box = await remove.boundingBox();

    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
    await remove.focus();
    await expect(remove).toBeFocused();
    expect(
      await remove.evaluate((element) => getComputedStyle(element).boxShadow),
    ).not.toBe("none");
    await expect(page).toHaveScreenshot("tags-input-remove-focus.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(
      <div className="p-4">
        <TagsInput
          aria-label="Framework tags"
          defaultValue={["React", "Vue", "Svelte", "Solid", "Angular"]}
        />
      </div>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("tags-input-mobile.png");
    expect(errors).toEqual([]);
  });
});
