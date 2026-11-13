import { expect, test } from "@playwright/experimental-ct-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

import type { TabsVariant } from "./tabs";

const VARIANTS: readonly TabsVariant[] = ["underline", "pill", "link"];

function accountTabs(variant?: TabsVariant) {
  return (
    <Tabs defaultValue="account" variant={variant}>
      <TabsList aria-label="Account settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Update your name and email.</TabsContent>
      <TabsContent value="password">Change your password.</TabsContent>
      <TabsContent value="billing">Manage your plan.</TabsContent>
    </Tabs>
  );
}

test.describe("Tabs Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Tabs>Test</Tabs>);
    await expect(page).toHaveScreenshot("tabs-default.png");
  });

  test("underline", async ({ mount, page }) => {
    await mount(accountTabs());
    await expect(page).toHaveScreenshot("tabs-underline.png");
  });

  test("variant-pill", async ({ mount, page }) => {
    await mount(accountTabs("pill"));
    await expect(page).toHaveScreenshot("tabs-variant-pill.png");
  });

  test("variant-link", async ({ mount, page }) => {
    await mount(accountTabs("link"));
    await expect(page).toHaveScreenshot("tabs-variant-link.png");
  });

  for (const variant of VARIANTS) {
    test(`focus-visible-${variant}`, async ({ mount, page }) => {
      await mount(accountTabs(variant));
      await page.keyboard.press("Tab");
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();
      await expect(page).toHaveScreenshot(`tabs-focus-visible-${variant}.png`);
    });
  }

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(
      <Tabs defaultValue="account" variant="pill">
        <TabsList aria-label="Account settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Update your name and email.</TabsContent>
      </Tabs>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("tabs-mobile.png");
    expect(errors).toEqual([]);
  });
});
