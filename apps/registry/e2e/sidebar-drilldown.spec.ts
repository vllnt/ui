import { expect, test } from "@playwright/test";

/**
 * Sidebar drill-down (component-sidebar phase).
 *
 * The component sidebar groups 309 components by family and shows ONE level at
 * a time: the family list (ROOT) or a single family's components (FAMILY). On a
 * component page it auto-drills into that component's family, and the breadcrumb
 * gains a family crumb. These tests drive the real registry like a user.
 *
 * Button lives in the "core" family (alongside Input / Label / Textarea); the
 * "form" component lives in the "form" family — used as the drill target.
 */

const SIDEBAR = "aside";

test.describe("component sidebar drill-down", () => {
  test("auto-drills into the active component's family", async ({ page }) => {
    await page.goto("/components/button");
    const sidebar = page.locator(SIDEBAR).first();

    // Drilled in: a "back" control is present and the active item is marked.
    await expect(
      sidebar.getByRole("button", { name: "All families" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { exact: true, name: "Button" }),
    ).toHaveAttribute("aria-current", "page");

    // Family listing only: a sibling core component is shown.
    await expect(
      sidebar.getByRole("link", { exact: true, name: "Input" }),
    ).toBeVisible();

    // Breadcrumb gains the family crumb: Components / Core / Button.
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb.getByText("Core", { exact: true })).toBeVisible();
  });

  test("back returns to the family list; selecting a family drills in", async ({
    page,
  }) => {
    await page.goto("/components/button");
    const sidebar = page.locator(SIDEBAR).first();

    await sidebar.getByRole("button", { name: "All families" }).click();

    // ROOT: families are listed; the previous family's items are gone.
    await expect(sidebar.getByRole("button", { name: /^Form/ })).toBeVisible();
    await expect(
      sidebar.getByRole("link", { exact: true, name: "Button" }),
    ).toHaveCount(0);

    // Drill into Form: the back control returns and the family's items render.
    await sidebar.getByRole("button", { name: /^Form/ }).click();
    await expect(
      sidebar.getByRole("button", { name: "All families" }),
    ).toBeVisible();
    await expect(
      sidebar.locator('a[href$="/components/form"]'),
    ).toBeVisible();
  });
});
