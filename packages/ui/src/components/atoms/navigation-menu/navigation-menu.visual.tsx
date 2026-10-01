import { expect, test } from "@playwright/experimental-ct-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";

test.describe("NavigationMenu Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<NavigationMenu />);
    await expect(page).toHaveScreenshot("navigation-menu-default.png");
  });
});

test.describe("NavigationMenu keyboard", () => {
  test("ArrowDown on an open trigger moves focus into its content", async ({
    mount,
    page,
  }) => {
    await mount(
      <NavigationMenu aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul>
                <li>
                  <NavigationMenuLink href="#install">Installation</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#patterns">Patterns</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const trigger = page.getByRole("button", { name: "Guides" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("link", { name: "Installation" })).toBeFocused();
  });
});
