import { expect, test } from "@playwright/experimental-ct-react";

import { SidebarProvider } from "../sidebar-provider";
import { NavbarSaas } from "./navbar-saas";

test.describe("NavbarSaas Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <SidebarProvider>
        <NavbarSaas
          brand="Acme Inc"
          navItems={[
            { href: "/", title: "Home" },
            { href: "/docs", title: "Docs" },
            { href: "/blog", title: "Blog" },
          ]}
        />
      </SidebarProvider>,
    );
    await expect(page).toHaveScreenshot("navbar-saas-default.png");
  });
});
