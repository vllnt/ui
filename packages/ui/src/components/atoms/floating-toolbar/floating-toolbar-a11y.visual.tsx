import { expect, test } from "@playwright/experimental-ct-react";

import { FloatingToolbar } from "./floating-toolbar";

const noop = (): void => undefined;

const toolbar = (
  <div>
    <button type="button">Before</button>
    <div className="relative h-16">
      <FloatingToolbar
        actions={[
          { id: "rename", label: "Rename", onActivate: noop },
          { id: "duplicate", label: "Duplicate", onActivate: noop },
          { disabled: true, id: "lock", label: "Lock", onActivate: noop },
          {
            id: "delete",
            label: "Delete",
            onActivate: noop,
            variant: "destructive",
          },
        ]}
        x={0}
        y={48}
      />
    </div>
    <button type="button">After</button>
  </div>
);

test.describe("FloatingToolbar keyboard", () => {
  test("is one tab stop: Tab enters on the first action and the next Tab leaves", async ({
    mount,
    page,
  }) => {
    await mount(toolbar);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Before" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Rename" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "After" })).toBeFocused();
  });

  test("arrows, Home and End move between actions, skip disabled ones and wrap", async ({
    mount,
    page,
  }) => {
    await mount(toolbar);
    await page.getByRole("button", { name: "Rename" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: "Duplicate" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: "Delete" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: "Rename" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("button", { name: "Delete" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.getByRole("button", { name: "Rename" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("button", { name: "Delete" })).toBeFocused();
  });

  test("Shift+Tab re-enters on the action that had focus last", async ({
    mount,
    page,
  }) => {
    await mount(toolbar);
    await page.getByRole("button", { name: "Rename" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "After" })).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Duplicate" })).toBeFocused();
  });
});

test.describe("FloatingToolbar motion", () => {
  test("the colour transition runs by default and stops under reduced motion", async ({
    mount,
    page,
  }) => {
    await mount(toolbar);
    const action = page.getByRole("button", { name: "Rename" });
    const property = () =>
      action.evaluate(
        (element) => getComputedStyle(element).transitionProperty,
      );

    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await property()).not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await property()).toBe("none");
  });
});
