import { expect, test } from "@playwright/experimental-ct-react";

import { Breadcrumb } from "./breadcrumb";

const TRAIL = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/ui", label: "UI" },
  { href: "/docs/ui/atoms", label: "Atoms" },
  { label: "Breadcrumb" },
];

test.describe("Breadcrumb Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Breadcrumb items={TRAIL.slice(0, 3)} />);
    await expect(page).toHaveScreenshot("breadcrumb-default.png");
  });

  test("overflow-collapsed", async ({ mount, page }) => {
    await mount(<Breadcrumb items={TRAIL} overflow="collapsed" />);
    await expect(page).toHaveScreenshot("breadcrumb-overflow-collapsed.png");
  });

  test("localised", async ({ mount, page }) => {
    await mount(
      <Breadcrumb
        items={TRAIL}
        labels={{ more: "Plus", region: "Fil d'Ariane" }}
        overflow="collapsed"
      />,
    );
    await expect(page).toHaveScreenshot("breadcrumb-localised.png");
  });

  test("separator-slash", async ({ mount, page }) => {
    await mount(<Breadcrumb items={TRAIL.slice(0, 3)} separator="slash" />);
    await expect(page).toHaveScreenshot("breadcrumb-separator-slash.png");
  });

  test("variant-minimal", async ({ mount, page }) => {
    await mount(<Breadcrumb items={TRAIL.slice(0, 3)} variant="minimal" />);
    await expect(page).toHaveScreenshot("breadcrumb-variant-minimal.png");
  });

  test("current page is exposed to assistive technology", async ({
    mount,
    page,
  }) => {
    await mount(<Breadcrumb items={TRAIL} overflow="collapsed" />);
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeVisible();
    const current = page.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("Breadcrumb");
    await expect(page.getByRole("link")).toHaveCount(2);
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    await page.setViewportSize({ height: 844, width: 390 });
    await mount(<Breadcrumb items={TRAIL} overflow="collapsed" />);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("breadcrumb-mobile.png");
    expect(errors).toEqual([]);
  });
});
