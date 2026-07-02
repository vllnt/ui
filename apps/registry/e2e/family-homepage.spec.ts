import { expect, test } from "@playwright/test";

/**
 * Component family homepages (component-family phase).
 *
 * Every category — `ai` included — shares one landing template at
 * /families/[category] with a hero, SEO sub-groups, a component grid, and a
 * breadcrumb. The /components index family headings and the component-page
 * family crumb both link here. `/ai` permanently redirects to /families/ai.
 */

test.describe("component family homepage", () => {
  test("renders a family landing with its components", async ({ page }) => {
    await page.goto("/families/form");

    await expect(
      page.getByRole("heading", { level: 1, name: "Form components" }),
    ).toBeVisible();

    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb.getByText("Form", { exact: true })).toBeVisible();

    // The grid links into individual component pages.
    await expect(
      page.locator('main a[href*="/components/"]').first(),
    ).toBeVisible();
  });

  test("the ai family uses the shared grouped landing template", async ({
    page,
  }) => {
    await page.goto("/families/ai");

    await expect(
      page.getByRole("heading", { level: 1, name: "AI components" }),
    ).toBeVisible();

    // SEO sub-groups render — the shared template, not the old bespoke hub.
    await expect(
      page.getByRole("heading", { level: 2, name: "Chat & Conversation" }),
    ).toBeVisible();
  });

  test("an unknown family 404s", async ({ page }) => {
    const response = await page.goto("/families/not-a-real-family");
    expect(response?.status()).toBe(404);
  });

  test("the component-page family crumb links to the family page", async ({
    page,
  }) => {
    await page.goto("/components/form");

    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await breadcrumb.getByRole("link", { exact: true, name: "Form" }).click();

    await expect(page).toHaveURL(/\/families\/form$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Form components" }),
    ).toBeVisible();
  });
});
