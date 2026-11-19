import { expect, test } from "@playwright/experimental-ct-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const fruitSelect = (label: string, invalid?: boolean) => (
  <Select>
    <SelectTrigger aria-invalid={invalid} aria-label={label}>
      <SelectValue placeholder="Pick a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem disabled value="banana">
        Banana
      </SelectItem>
      <SelectItem value="cherry">Cherry</SelectItem>
    </SelectContent>
  </Select>
);

test.describe("Select keyboard", () => {
  test("opens, skips disabled items, selects and returns focus to the trigger", async ({
    mount,
    page,
  }) => {
    await mount(fruitSelect("Fruit"));
    const trigger = page.locator('button[aria-label="Fruit"]');

    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("option", { name: "Apple" })).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Cherry" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(trigger).toHaveText("Cherry");
    await expect(trigger).toBeFocused();
  });

  test("Home, End and typeahead move between enabled items", async ({
    mount,
    page,
  }) => {
    await mount(fruitSelect("Fruit"));
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.press("End");
    await expect(page.getByRole("option", { name: "Cherry" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.getByRole("option", { name: "Apple" })).toBeFocused();
    await page.keyboard.press("c");
    await expect(page.getByRole("option", { name: "Cherry" })).toBeFocused();
  });

  test("Escape closes without changing the value and returns focus", async ({
    mount,
    page,
  }) => {
    await mount(fruitSelect("Fruit"));
    const trigger = page.locator('button[aria-label="Fruit"]');

    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");

    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(trigger).toHaveText("Pick a fruit");
    await expect(trigger).toBeFocused();
  });
});

test.describe("Select aria-invalid", () => {
  test("an invalid trigger takes the destructive border, never a word colour", async ({
    mount,
    page,
  }) => {
    await mount(
      <div>
        <div className="border border-destructive" data-testid="ref-destructive" />
        <div className="border border-input" data-testid="ref-input" />
        {fruitSelect("Invalid fruit", true)}
        {fruitSelect("Valid fruit")}
      </div>,
    );
    const trigger = (label: string) =>
      page.locator(`button[aria-label="${label}"]`);
    const border = (label: string) =>
      trigger(label).evaluate(
        (element) => getComputedStyle(element).borderTopColor,
      );
    const colour = (label: string) =>
      trigger(label).evaluate((element) => getComputedStyle(element).color);
    const reference = (testId: string) =>
      page
        .getByTestId(testId)
        .evaluate((element) => getComputedStyle(element).borderTopColor);

    const destructive = await reference("ref-destructive");
    const input = await reference("ref-input");
    expect(destructive).not.toBe(input);
    expect(await border("Invalid fruit")).toBe(destructive);
    expect(await border("Valid fruit")).toBe(input);
    expect(await colour("Invalid fruit")).toBe(await colour("Valid fruit"));
  });
});

test.describe("Select motion", () => {
  test("the open menu animates by default and holds still under reduced motion", async ({
    mount,
    page,
  }) => {
    await mount(fruitSelect("Fruit"));
    const animationName = async (): Promise<string> => {
      await page.locator('button[aria-label="Fruit"]').click();
      const name = await page
        .getByRole("listbox")
        .evaluate((element) => getComputedStyle(element).animationName);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("listbox")).toBeHidden();
      return name;
    };

    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await animationName()).not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await animationName()).toBe("none");
  });
});
