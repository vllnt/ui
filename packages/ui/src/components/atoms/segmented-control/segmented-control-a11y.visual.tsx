import { expect, test } from "@playwright/experimental-ct-react";

import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

const control = (
  <div>
    <button type="button">Before</button>
    <SegmentedControl aria-label="View" defaultValue="overview">
      <SegmentedControlItem value="overview">Overview</SegmentedControlItem>
      <SegmentedControlItem value="details">Details</SegmentedControlItem>
      <SegmentedControlItem disabled value="settings">
        Settings
      </SegmentedControlItem>
      <SegmentedControlItem value="history">History</SegmentedControlItem>
    </SegmentedControl>
    <button type="button">After</button>
  </div>
);

test.describe("SegmentedControl keyboard", () => {
  test("is one tab stop that lands on the selected item", async ({
    mount,
    page,
  }) => {
    await mount(control);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Before" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("radio", { name: "Overview" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "After" })).toBeFocused();
  });

  test("arrows, Home and End move focus, skip disabled items and wrap", async ({
    mount,
    page,
  }) => {
    await mount(control);
    await page.getByRole("radio", { name: "Overview" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Details" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "History" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Overview" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("radio", { name: "History" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.getByRole("radio", { name: "Overview" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("radio", { name: "History" })).toBeFocused();
  });

  test("Space and Enter select the focused item", async ({ mount, page }) => {
    await mount(control);
    await page.getByRole("radio", { name: "Overview" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Details" })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByRole("radio", { name: "Details" })).toBeChecked();
    await expect(
      page.getByRole("radio", { name: "Overview" }),
    ).not.toBeChecked();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "History" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("radio", { name: "History" })).toBeChecked();
  });
});

test.describe("SegmentedControl motion", () => {
  test("the selection transition runs by default and stops under reduced motion", async ({
    mount,
    page,
  }) => {
    await mount(control);
    const item = page.getByRole("radio", { name: "Overview" });
    const property = () =>
      item.evaluate((element) => getComputedStyle(element).transitionProperty);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await property()).not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await property()).toBe("none");
  });
});
